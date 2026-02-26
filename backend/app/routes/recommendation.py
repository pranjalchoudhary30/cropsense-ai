from fastapi import APIRouter
from pydantic import BaseModel
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/recommend-market", tags=["Market Recommendation"])
service = RecommendationEngine()

class RecommendationRequest(BaseModel):
    crop: str
    location: str

@router.post("/")
async def recommend_market(request: RecommendationRequest):
    result = await service.recommend_market(request.crop, request.location)
    return result
