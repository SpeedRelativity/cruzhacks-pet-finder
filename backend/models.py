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

# User details for contact
class UserInfo(BaseModel):
    name: str
    email: str
    phone: str
    location: str  # City/address where pet was lost/found

# This is the actual database 'Collection'
class PetReport(Document):
    user_id: str
    report_type: str  # 'Lost' or 'Found'
    
    # Pet Information
    pet_name: Optional[str] = None
    pet_type: str  # Dog, Cat, etc.
    
    # User Information
    user_info: UserInfo
    
    # Images (list of S3 URLs)
    image_urls: List[str]  # Can have multiple images
    
    # AI-generated tags
    tags: PetTags
    
    # Additional details
    description: Optional[str] = None  # Additional notes
    location: dict = {"type": "Point", "coordinates": [0.0, 0.0]}
    
    # Timestamps
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "pet_reports"

