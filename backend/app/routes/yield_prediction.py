"""
Routes for the Yield & Profit Prediction feature.

Endpoints:
  POST /yield/predict  — run prediction, save to MongoDB
  GET  /yield/history  — user's past predictions (newest first)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId

from app.models.yield_model import (
    YieldPredictionRequest,
    YieldPredictionResult,
    YieldHistoryResponse,
)
from app.services.yield_service import predict_yield
from app.routes.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/yield", tags=["Yield Prediction"])


@router.post("/predict", response_model=YieldPredictionResult)
async def predict_yield_route(
    req: YieldPredictionRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Run the yield & profit prediction for the given farm inputs.
    Saves the result to the user's prediction history.
    """
    try:
        result = await predict_yield(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}",
        )

    # ── Persist to MongoDB ──
    record = {
        "user_email": current_user.email,
        "cropName": result.cropName,
        "landSize": result.landSize,
        "unit": result.unit,
        "predictedYield": result.predictedYield,
        "yieldPerAcre": result.yieldPerAcre,
        "expectedRevenue": result.expectedRevenue,
        "estimatedCost": result.estimatedCost,
        "expectedProfit": result.expectedProfit,
        "riskLevel": result.riskLevel,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "soilType": req.soilType,
        "irrigation": req.irrigation,
        "weatherSummary": result.weatherSummary,
        "timestamp": datetime.utcnow(),
    }
    await db["yield_predictions"].insert_one(record)

    return result


@router.get("/history", response_model=list[YieldHistoryResponse])
async def get_yield_history(
    limit: int = 20,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return the most recent yield predictions for the logged-in user."""
    cursor = (
        db["yield_predictions"]
        .find({"user_email": current_user.email})
        .sort("timestamp", -1)
        .limit(limit)
    )
    records = []
    async for doc in cursor:
        records.append(
            YieldHistoryResponse(
                id=str(doc["_id"]),
                cropName=doc["cropName"],
                landSize=doc["landSize"],
                unit=doc["unit"],
                predictedYield=doc["predictedYield"],
                expectedProfit=doc["expectedProfit"],
                riskLevel=doc["riskLevel"],
                timestamp=doc["timestamp"],
            )
        )
    return records
