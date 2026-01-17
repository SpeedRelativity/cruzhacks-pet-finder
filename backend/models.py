from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# This defines the 'Smart Tags' the AI will generate
class PetTags(BaseModel):
    species: str
    breed: str
    primary_color: str
    age_group: str 
    marks: List[str]

# This is the actual database 'Collection'
class PetReport(Document):
    user_id: str
    report_type: str # 'LOST' or 'FOUND'
    image_url: str
    tags: PetTags
    location: dict = {"type": "Point", "coordinates": [0.0, 0.0]}
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "pet_reports"