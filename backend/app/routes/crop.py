from fastapi import APIRouter
from app.repositories.crop_repository import CropRepository
from app.models.crop_model import CropBase

router = APIRouter(prefix="/crop", tags=["Crops"])
repo = CropRepository()

@router.get("/")
async def list_crops():
    return await repo.get_crops()

@router.post("/")
async def create_crop(crop: CropBase):
    result_id = await repo.add_crop(crop.model_dump())
    return {"id": result_id, "message": "Crop created successfully"}
