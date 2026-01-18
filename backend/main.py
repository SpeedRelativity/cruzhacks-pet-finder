import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from uuid import uuid4
import json

from models import PetReport, PetTags, UserInfo
from ai_service import analyze_pet_image
from s3_config import upload_to_s3

load_dotenv()
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock AI response for testing (when Gemini API is unavailable)
def get_mock_ai_response(filename: str) -> dict:
    """Return mock AI analysis for testing S3 upload flow"""
    return {
        "species": "Dog",
        "breed": "Golden Retriever",
        "primary_color": "Golden",
        "age_group": "Adult",
        "marks": ["Fluffy coat", "Long ears"]
    }

async def get_ai_tags(image_bytes: bytes):
    """Try real AI, fall back to mock on error"""
    try:
        return await analyze_pet_image(image_bytes)
    except Exception as e:
        print(f"⚠️ AI ERROR: {str(e)}")
        print("🔄 Using mock AI response for testing...")
        return get_mock_ai_response("")

@app.on_event("startup")
async def startup_event():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        await init_beanie(database=client["SlugHacks"], document_models=[PetReport])
        print("✅ SUCCESS: Connected to MongoDB Atlas")
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")

@app.post("/api/reports")
async def create_report(
    files: list[UploadFile] = File(...),
    report_type: str = Form(...),
    pet_name: str = Form(...),
    pet_type: str = Form(...),
    user_name: str = Form(...),
    user_email: str = Form(...),
    user_phone: str = Form(...),
    user_location: str = Form(...),
    description: str = Form(default="")
):
    print(f"--- Processing New {report_type} Report ---")
    
    try:
        # 1. Upload all images to S3
        print("1. Uploading images to S3...")
        image_urls = []
        
        for file in files:
            file_bytes = await file.read()
            object_key = f"pet-reports/{uuid4()}/{file.filename}"
            image_url = await upload_to_s3(file_bytes, os.getenv("S3_BUCKET_NAME"), object_key)
            image_urls.append(image_url)
            print(f"   ✅ Uploaded: {image_url}")
        
        # 2. Run AI on first image for tags
        print("2. Analyzing first image with AI...")
        first_file = files[0]
        first_bytes = await first_file.read()
        tags_data = await get_ai_tags(first_bytes)
        print(f"3. AI Results: {tags_data}")

        # 3. Create user info
        user_info = UserInfo(
            name=user_name,
            email=user_email,
            phone=user_phone,
            location=user_location
        )

        # 4. Create Report with all data
        new_report = PetReport(
            user_id="slug_hacker_1",
            report_type=report_type,
            pet_name=pet_name,
            pet_type=pet_type,
            user_info=user_info,
            image_urls=image_urls,
            tags=PetTags(**tags_data),
            description=description
        )
        
        # 5. Save to DB
        await new_report.insert()
        print("4. Saved to MongoDB!")
        
        return {
            "status": "Success",
            "report_id": str(new_report.id),
            "detected_pet": tags_data,
            "image_urls": image_urls,
            "pet_details": {
                "name": pet_name,
                "type": pet_type,
                "location": user_location
            }
        }

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports")
async def get_reports():
    """Fetch all pet reports from MongoDB"""
    try:
        reports = await PetReport.find_all().to_list()
        return reports
    except Exception as e:
        print(f"❌ DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
