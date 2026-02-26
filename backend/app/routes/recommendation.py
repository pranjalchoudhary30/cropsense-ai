from fastapi import APIRouter
from pydantic import BaseModel
from app.services.recommendation_engine import RecommendationEngine
from fastapi import Depends
from app.routes.auth import get_current_user

router = APIRouter(prefix="/recommend-market", tags=["Market Recommendation"])
service = RecommendationEngine()

class RecommendationRequest(BaseModel):
    crop: str
    location: str

@router.post("/")
async def recommend_market(request: RecommendationRequest, current_user=Depends(get_current_user)):
    result = await service.recommend_market(request.crop, request.location)
    return result
