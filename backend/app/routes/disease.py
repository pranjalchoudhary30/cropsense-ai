"""
Disease Detection Routes
--------------------------
POST /disease/detect   — upload a leaf image, receive AI disease analysis
GET  /disease/history  — get paginated detection history for the current user
"""
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.database import get_db
from app.models.disease_model import DetectionHistoryResponse, DiseaseDetectionResult
from app.routes.auth import get_current_user
from app.services import disease_service

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

# ── Allowed image MIME types ──────────────────────────────────────────────────
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/detect", response_model=DiseaseDetectionResult, status_code=status.HTTP_200_OK)
async def detect_disease(
    file: UploadFile = File(..., description="Leaf image (JPEG / PNG / WebP, max 10 MB)"),
    crop_hint: Optional[str] = Form(None, description="Optional crop type hint (e.g. wheat, rice)"),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Upload a leaf photo → get disease name, confidence, severity, treatment & prevention.
    The scan is saved to the user's detection history in MongoDB.
    """
    # ── Validation ─────────────────────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{file.content_type}'. Upload JPEG, PNG or WebP.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds the 10 MB limit. Please compress and retry.",
        )
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty.",
        )

    # ── Upload + Analyse ────────────────────────────────────────────────────
    try:
        image_url = await disease_service.upload_image(file_bytes, file.filename or "leaf.jpg")
        result = await disease_service.analyze_disease(file_bytes, image_url, crop_hint)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Analysis failed: {str(exc)}",
        )

    # ── Persist history in MongoDB ──────────────────────────────────────────
    history_doc = {
        "user_email": current_user.email,
        "diseaseName": result["diseaseName"],
        "confidence": result["confidence"],
        "severity": result["severity"],
        "treatment": result["treatment"],
        "pesticide": result["pesticide"],
        "prevention": result["prevention"],
        "imageUrl": result["imageUrl"],
        "crop_hint": crop_hint,
        "timestamp": datetime.utcnow(),
    }
    try:
        await db["disease_detections"].insert_one(history_doc)
    except Exception:
        pass  # History write failure must not block the response

    return DiseaseDetectionResult(**result)


@router.get("/history", response_model=list[DetectionHistoryResponse])
async def get_detection_history(
    limit: int = 20,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Return the most recent detections for the authenticated user (newest first)."""
    cursor = (
        db["disease_detections"]
        .find({"user_email": current_user.email})
        .sort("timestamp", -1)
        .limit(max(1, min(limit, 100)))
    )

    history = []
    async for doc in cursor:
        history.append(
            DetectionHistoryResponse(
                id=str(doc["_id"]),
                diseaseName=doc["diseaseName"],
                confidence=doc["confidence"],
                severity=doc["severity"],
                imageUrl=doc["imageUrl"],
                crop_hint=doc.get("crop_hint"),
                timestamp=doc["timestamp"],
            )
        )
    return history
