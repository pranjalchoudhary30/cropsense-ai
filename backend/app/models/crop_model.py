from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CropBase(BaseModel):
    name: str
    season: str
    expected_yield: Optional[float] = None

class CropInDB(CropBase):
    id: str
    created_at: datetime = datetime.utcnow()
    
    model_config = ConfigDict(from_attributes=True)
