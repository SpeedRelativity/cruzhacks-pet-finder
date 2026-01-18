from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# This defines the 'Smart Tags' the AI will generate
class PetTags(BaseModel):
    species: str
    breed: str
    primary_color: str
    age_group: str  # Puppy/Kitten, Young, Adult, Senior
    marks: List[str]  # Distinguishing features
    size: str  # Small, Medium, Large

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
    pet_type: str  # Dog, Cat, Bird, etc.
    
    # User Information
    user_info: UserInfo
    
    # Images (list of S3 URLs) - for carousel display
    image_urls: List[str]  # Can have multiple images for carousel
    
    # AI-generated tags for matching/search
    tags: PetTags
    
    # Additional details
    description: Optional[str] = None  # Additional notes/description
    
    # Location data (for map features)
    location: dict = {"type": "Point", "coordinates": [0.0, 0.0]}  # [longitude, latitude]
    
    # Status tracking
    status: str = "active"  # active, found, closed
    
    # Timestamps
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "pet_reports"
        indexes = [
            "report_type",
            "pet_type",
            "status",
            "created_at",
            [("location", "2dsphere")]  # Geospatial index for location-based queries
        ]


# Match between Lost and Found reports
class PetMatch(Document):
    lost_report_id: str  # ID of the Lost pet report
    found_report_id: str  # ID of the Found pet report
    
    # Match details
    match_score: int  # Number of matching tags (0-3)
    matched_tags: List[str]  # Which tags matched (e.g., ["species", "breed", "primary_color"])
    
    # Decision tracking
    status: str = "pending"  # pending, accepted, rejected
    decision_made_by: Optional[str] = None  # User who made the decision
    decision_made_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "pet_matches"
        indexes = [
            "lost_report_id",
            "found_report_id",
            "status",
            "match_score",
            "created_at"
        ]

