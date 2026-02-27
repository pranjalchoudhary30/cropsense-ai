"""
Pydantic models for the Disease Detection feature.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DiseaseDetectionResult(BaseModel):
    """The structured AI response returned to the frontend."""
    diseaseName: str
    confidence: float          # 0–100
    severity: str              # "Low" | "Medium" | "High"
    treatment: List[str]
    pesticide: str
    prevention: List[str]
    imageUrl: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DetectionHistoryItem(BaseModel):
    """MongoDB document schema — one record per scan."""
    user_email: str
    diseaseName: str
    confidence: float
    severity: str
    treatment: List[str]
    pesticide: str
    prevention: List[str]
    imageUrl: str
    crop_hint: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DetectionHistoryResponse(BaseModel):
    """Slimmed-down record returned in the history list."""
    id: str
    diseaseName: str
    confidence: float
    severity: str
    imageUrl: str
    crop_hint: Optional[str] = None
    timestamp: datetime
