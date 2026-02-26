from fastapi import APIRouter
from pydantic import BaseModel
from app.services.spoilage_model import SpoilageModel

router = APIRouter(prefix="/spoilage-risk", tags=["Spoilage Risk"])
service = SpoilageModel()

class SpoilageRequest(BaseModel):
    temperature: float
    humidity: float
    storage_type: str
    transit_days: int

@router.post("/")
async def calculate_spoilage_risk(request: SpoilageRequest):
    result = await service.calculate_risk(
        temperature=request.temperature,
        humidity=request.humidity,
        storage_type=request.storage_type,
        transit_days=request.transit_days
    )
    return result
