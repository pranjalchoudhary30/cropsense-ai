from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MandiPrice(BaseModel):
    mandi_name: str
    crop: str
    date: datetime
    price: float
    volume: float

    model_config = ConfigDict(from_attributes=True)
