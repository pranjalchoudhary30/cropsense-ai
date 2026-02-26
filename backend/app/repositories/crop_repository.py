from app.database import get_db

class CropRepository:
    def __init__(self):
        pass

    async def get_crops(self):
        db = get_db()
        cursor = db.crops.find({})
        return await cursor.to_list(length=100)

    async def add_crop(self, crop_data: dict):
        db = get_db()
        result = await db.crops.insert_one(crop_data)
        return str(result.inserted_id)
