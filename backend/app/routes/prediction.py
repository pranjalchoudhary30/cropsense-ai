from fastapi import APIRouter
from pydantic import BaseModel
from app.services.price_forecasting import PriceForecastingService
from fastapi import Depends
from app.routes.auth import get_current_user

router = APIRouter(prefix="/predict-price", tags=["Prediction"])
service = PriceForecastingService()

class PredictionRequest(BaseModel):
    crop: str
    location: str

@router.post("/")
async def predict_price(request: PredictionRequest, current_user=Depends(get_current_user)):
    result = await service.predict_price(request.crop, request.location)
    return result
