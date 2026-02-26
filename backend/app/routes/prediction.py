from fastapi import APIRouter
from pydantic import BaseModel
from app.services.price_forecasting import PriceForecastingService

router = APIRouter(prefix="/predict-price", tags=["Prediction"])
service = PriceForecastingService()

class PredictionRequest(BaseModel):
    crop: str
    location: str

@router.post("/")
async def predict_price(request: PredictionRequest):
    result = await service.predict_price(request.crop, request.location)
    return result
