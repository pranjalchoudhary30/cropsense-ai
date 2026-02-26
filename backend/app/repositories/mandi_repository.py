from app.database import get_db

class MandiRepository:
    def __init__(self):
        pass

    async def get_mandi_prices(self, crop: str = None):
        db = get_db()
        query = {"crop": crop} if crop else {}
        cursor = db.mandi_prices.find(query)
        return await cursor.to_list(length=100)
