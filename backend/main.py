import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

from models import PetReport, PetTags
from ai_service import analyze_pet_image

load_dotenv()
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        await init_beanie(database=client["SlugHacks"], document_models=[PetReport])
        print("✅ SUCCESS: Connected to MongoDB Atlas")
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")

@app.post("/api/reports")
async def create_report(file: UploadFile = File(...), type: str = Form(...)):
    print(f"--- Processing New {type} Report ---")
    
    try:
        # 1. Read Image
        image_bytes = await file.read()
        print("1. Image bytes read successfully")

        # 2. Run AI
        print("2. Sending to Gemini AI...")
        tags_data = await analyze_pet_image(image_bytes)
        print(f"3. AI Results received: {tags_data}")

        # 3. Create Report
        new_report = PetReport(
            user_id="slug_hacker_1",
            report_type=type,
            image_url="pending_upload", 
            tags=PetTags(**tags_data)
        )
        
        # 4. Save to DB
        await new_report.insert()
        print("4. Saved to MongoDB!")
        
        return {"status": "Success", "detected_pet": tags_data}

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
