from fastapi import APIRouter
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])
service = WeatherService()

@router.get("/")
async def get_weather(location: str):
    result = await service.get_weather(location)
    return result
