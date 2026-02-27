"""
Pydantic models for the Yield & Profit Prediction system.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class YieldPredictionRequest(BaseModel):
    latitude: float = Field(..., description="Farm latitude")
    longitude: float = Field(..., description="Farm longitude")
    crop: str = Field(..., description="Crop name e.g. wheat, rice")
    landSize: float = Field(..., gt=0, description="Land area")
    unit: str = Field("acres", description="'acres' or 'hectares'")
    soilType: str = Field(..., description="Soil type")
    irrigation: bool = Field(False, description="Irrigation available?")


class WeatherData(BaseModel):
    temperature: float
    humidity: float
    rainfall_forecast: float   # mm expected over crop season (mock)
    wind_speed: float
    description: str


class YieldPredictionResult(BaseModel):
    predictedYield: float          # tons
    yieldPerAcre: float            # tons/acre
    expectedRevenue: float         # ₹
    estimatedCost: float           # ₹
    expectedProfit: float          # ₹
    riskLevel: str                 # Low / Medium / High
    weatherSummary: str
    recommendations: List[str]
    weatherData: WeatherData
    cropName: str
    landSize: float
    unit: str
    timestamp: Optional[datetime] = None


class YieldHistoryRecord(BaseModel):
    """Stored in MongoDB yield_predictions collection."""
    user_email: str
    cropName: str
    landSize: float
    unit: str
    predictedYield: float
    expectedProfit: float
    riskLevel: str
    latitude: float
    longitude: float
    timestamp: datetime


class YieldHistoryResponse(BaseModel):
    id: str
    cropName: str
    landSize: float
    unit: str
    predictedYield: float
    expectedProfit: float
    riskLevel: str
    timestamp: datetime
