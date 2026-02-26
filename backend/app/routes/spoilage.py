from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.spoilage_model import SpoilageModel
from fastapi import Depends
from app.routes.auth import get_current_user

router = APIRouter(prefix="/spoilage-risk", tags=["Spoilage Risk"])
service = SpoilageModel()

class SpoilageRequest(BaseModel):
    temperature: float
    humidity: float
    storage_type: str = "warehouse"
    transit_days: int = 3
    crop: Optional[str] = "default"

@router.post("/")
async def calculate_spoilage_risk(request: SpoilageRequest, current_user=Depends(get_current_user)):
    result = await service.calculate_risk(
        temperature=request.temperature,
        humidity=request.humidity,
        storage_type=request.storage_type,
        transit_days=request.transit_days,
        crop=request.crop or "default",
    )
    return result
