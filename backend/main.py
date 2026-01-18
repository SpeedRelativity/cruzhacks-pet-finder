import os
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
from uuid import uuid4
import json

from models import PetReport, PetTags, UserInfo, PetMatch
from ai_service import analyze_pet_image
from s3_config import upload_to_s3
from email_service import send_match_notification
from typing import Optional, List
from datetime import datetime

load_dotenv()
app = FastAPI(title="Pet Finder API", version="1.0.0")

# #region agent log
_DEBUG_LOG_PATH = "/home/necharkc/cruzhack/.cursor/debug.log"
def _log_debug(payload):
    try:
        os.makedirs(os.path.dirname(_DEBUG_LOG_PATH), exist_ok=True)
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception as e:
        # Fallback visibility if file write fails
        print(f"DEBUG_LOG_WRITE_FAILED path={_DEBUG_LOG_PATH} error={type(e).__name__}:{str(e)[:120]}")
# #endregion agent log

@app.on_event("startup")
async def _log_startup():
    # #region agent log
    _log_debug({
        "sessionId": "debug-session",
        "runId": "pre-fix",
        "hypothesisId": "H5",
        "location": "main.py:startup",
        "message": "FastAPI startup",
        "data": {"cwd": os.getcwd()},
        "timestamp": int(time.time() * 1000)
    })
    # #endregion agent log

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
        "marks": ["Fluffy coat", "Long ears"],
        "size": "Large"
    }

async def get_ai_tags(image_bytes: bytes, mime_type: str = "image/jpeg"):
    """Analyze image with Gemini AI. Only uses mock if API key is completely missing."""
    # Check if API key exists before trying
    api_key = os.getenv("GEMINI_API_KEY")
    # #region agent log
    _log_debug({
        "sessionId": "debug-session",
        "runId": "pre-fix",
        "hypothesisId": "H1",
        "location": "main.py:get_ai_tags:entry",
        "message": "get_ai_tags called",
        "data": {"image_bytes_len": len(image_bytes) if image_bytes else 0, "mime_type": mime_type, "api_key_present": bool(api_key), "api_key_len": len(api_key) if api_key else 0},
        "timestamp": int(time.time() * 1000)
    })
    # #endregion agent log
    if not api_key or api_key == "your_gemini_api_key_here" or len(api_key) < 10:
        print("⚠️ GEMINI_API_KEY not configured properly. Using mock response.")
        # #region agent log
        _log_debug({
            "sessionId": "debug-session",
            "runId": "pre-fix",
            "hypothesisId": "H1",
            "location": "main.py:get_ai_tags:mock_branch",
            "message": "Using mock response due to API key check",
            "data": {"api_key_present": bool(api_key), "api_key_len": len(api_key) if api_key else 0},
            "timestamp": int(time.time() * 1000)
        })
        # #endregion agent log
        return get_mock_ai_response("")
    
    # Try real AI analysis - don't catch errors, let them propagate
    print(f"🤖 Attempting Gemini AI analysis with {len(image_bytes)} bytes...")
    # #region agent log
    _log_debug({
        "sessionId": "debug-session",
        "runId": "pre-fix",
        "hypothesisId": "H2",
        "location": "main.py:get_ai_tags:before_analyze",
        "message": "Calling analyze_pet_image",
        "data": {"image_bytes_len": len(image_bytes) if image_bytes else 0, "mime_type": mime_type},
        "timestamp": int(time.time() * 1000)
    })
    # #endregion agent log
    result = await analyze_pet_image(image_bytes, mime_type)
    print(f"✅ AI analysis successful: {result.get('species')} - {result.get('breed')}")
    # #region agent log
    _log_debug({
        "sessionId": "debug-session",
        "runId": "pre-fix",
        "hypothesisId": "H3",
        "location": "main.py:get_ai_tags:after_analyze",
        "message": "analyze_pet_image returned",
        "data": {"species": result.get("species"), "breed": result.get("breed")},
        "timestamp": int(time.time() * 1000)
    })
    # #endregion agent log
    return result


def calculate_match_score(tags1: PetTags, tags2: PetTags) -> tuple[int, List[str]]:
    """
    Calculate match score between two pet tags.
    Returns (score, matched_tags) where score is 0-3 and matched_tags are the matching tag names.
    """
    matched_tags = []
    score = 0
    
    # Compare species
    if tags1.species.lower() == tags2.species.lower():
        score += 1
        matched_tags.append("species")
    
    # Compare breed
    if tags1.breed.lower() == tags2.breed.lower():
        score += 1
        matched_tags.append("breed")
    
    # Compare primary color
    if tags1.primary_color.lower() == tags2.primary_color.lower():
        score += 1
        matched_tags.append("primary_color")
    
    return score, matched_tags


async def find_matches(new_report: PetReport):
    """
    Find matching reports when a new report is created.
    If new report is 'Found', match with 'Lost' reports.
    If new report is 'Lost', match with 'Found' reports.
    Create PetMatch records for matches with score >= 3 (perfect matches).
    """
    try:
        # Determine which type of reports to search
        search_type = "Lost" if new_report.report_type == "Found" else "Found"
        
        # Find reports of opposite type
        candidate_reports = await PetReport.find({
            "report_type": search_type,
            "status": "active",
            "pet_type": new_report.pet_type  # Same pet type only
        }).to_list()
        
        print(f"🔍 Searching for matches: {len(candidate_reports)} {search_type} reports to check")
        
        matches_created = 0
        for candidate in candidate_reports:
            # Skip if it's the same report
            if str(candidate.id) == str(new_report.id):
                continue
            
            # Calculate match score
            if new_report.report_type == "Found":
                match_score, matched_tags = calculate_match_score(candidate.tags, new_report.tags)
                lost_id = str(candidate.id)
                found_id = str(new_report.id)
            else:
                match_score, matched_tags = calculate_match_score(new_report.tags, candidate.tags)
                lost_id = str(new_report.id)
                found_id = str(candidate.id)
            
            # Create match if score is 3/3 (perfect match)
            if match_score == 3:
                # Check if match already exists
                existing_match = await PetMatch.find_one({
                    "lost_report_id": lost_id,
                    "found_report_id": found_id
                })
                
                if not existing_match:
                    match = PetMatch(
                        lost_report_id=lost_id,
                        found_report_id=found_id,
                        match_score=match_score,
                        matched_tags=matched_tags,
                        status="pending"
                    )
                    await match.insert()
                    matches_created += 1
                    print(f"   ✅ Match created! Score: {match_score}/3, Tags: {', '.join(matched_tags)}")
                    
                    # Send email notification to the person who reported the lost pet
                    try:
                        from bson import ObjectId
                        lost_report = await PetReport.get(ObjectId(lost_id))
                        found_report = await PetReport.get(ObjectId(found_id))
                        
                        if lost_report and found_report:
                            # Get found pet image URL (first image)
                            found_image_url = found_report.image_urls[0] if found_report.image_urls else None
                            
                            # Prepare match details
                            match_details = {
                                'matched_tags': matched_tags,
                                'location': found_report.user_info.location
                            }
                            
                            # Send email to lost pet owner
                            email_sent = await send_match_notification(
                                recipient_email=lost_report.user_info.email,
                                recipient_name=lost_report.user_info.name,
                                pet_name=lost_report.pet_name or "your pet",
                                found_pet_image_url=found_image_url,
                                match_details=match_details
                            )
                            
                            if email_sent:
                                print(f"   📧 Email notification sent to {lost_report.user_info.email}")
                            else:
                                print(f"   ⚠️ Email notification could not be sent (check email configuration)")
                    except Exception as email_err:
                        print(f"   ⚠️ Error sending email notification: {str(email_err)}")
                        # Don't fail the match creation if email fails
        
        if matches_created > 0:
            print(f"🎉 Created {matches_created} new match(es)!")
        else:
            print("   ℹ️  No perfect matches found (need 3/3 tags to match)")
            
    except Exception as e:
        print(f"⚠️ Error finding matches: {str(e)}")
        import traceback
        traceback.print_exc()

@app.on_event("startup")
async def startup_event():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        await init_beanie(database=client["SlugHacks"], document_models=[PetReport, PetMatch])
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
    """
    Create a new pet report with image upload, AI tagging, S3 storage, and MongoDB save.
    Pipeline: Images -> S3 Upload -> AI Analysis -> MongoDB Save
    """
    print(f"--- Processing New {report_type} Report ---")
    
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="At least one image is required")
    
    try:
        # 1. Read all file bytes into memory (needed for both S3 and AI)
        print("1. Reading uploaded images...")
        file_data = []
        for file in files:
            file_bytes = await file.read()
            file_data.append({
                "bytes": file_bytes,
                "filename": file.filename or f"image_{uuid4()}.jpg",
                "content_type": file.content_type or "image/jpeg"
            })
            print(f"   ✅ Read {len(file_bytes)} bytes from {file.filename}")
        
        # 2. Upload all images to S3
        print("2. Uploading images to S3...")
        image_urls = []
        report_uuid = str(uuid4())
        
        for file_info in file_data:
            object_key = f"pet-reports/{report_uuid}/{file_info['filename']}"
            image_url = await upload_to_s3(
                file_info["bytes"], 
                os.getenv("S3_BUCKET_NAME"), 
                object_key
            )
            image_urls.append(image_url)
            print(f"   ✅ Uploaded to S3: {image_url}")
        
        # 3. Run AI analysis on first image for tags
        print("3. Analyzing first image with AI...")
        first_image = file_data[0]
        print(f"   📸 Image: {len(first_image['bytes'])} bytes, MIME: {first_image['content_type']}")
        
        try:
            tags_data = await get_ai_tags(first_image["bytes"], first_image["content_type"])
            print(f"   ✅ AI Results: Species={tags_data.get('species')}, Breed={tags_data.get('breed')}, Color={tags_data.get('primary_color')}")
        except Exception as ai_err:
            error_msg = f"AI analysis failed: {str(ai_err)}"
            print(f"   ❌ {error_msg}")
            import traceback
            traceback.print_exc()
            # Don't use mock - raise the error so user knows there's a problem
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to analyze image with AI: {str(ai_err)}. Please check Gemini API configuration."
            )

        # 4. Create user info
        user_info = UserInfo(
            name=user_name,
            email=user_email,
            phone=user_phone,
            location=user_location
        )

        # 5. Create Report document with all data
        print("4. Creating MongoDB document...")
        new_report = PetReport(
            user_id="slug_hacker_1",  # TODO: Get from auth token
            report_type=report_type,
            pet_name=pet_name,
            pet_type=pet_type,
            user_info=user_info,
            image_urls=image_urls,  # List of S3 URLs for carousel
            tags=PetTags(**tags_data),
            description=description,
            status="active"
        )
        
        # 6. Save to MongoDB
        await new_report.insert()
        print(f"   ✅ Saved to MongoDB with ID: {new_report.id}")
        
        # 7. Find matches with existing reports (skip for scraper_bot to prevent auto-matching)
        if new_report.user_id != "scraper_bot":
            print("5. Searching for matches...")
            await find_matches(new_report)
        else:
            print("5. Skipping match search for scraper_bot reports")
        
        # 8. Return success response with all data
        return {
            "status": "success",
            "message": f"{report_type} pet report created successfully",
            "report_id": str(new_report.id),
            "detected_pet": tags_data,
            "image_urls": image_urls,  # For carousel display
            "image_count": len(image_urls),
            "pet_details": {
                "name": pet_name,
                "type": pet_type,
                "location": user_location
            },
            "created_at": new_report.created_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/reports")
async def get_reports(
    report_type: Optional[str] = None,
    pet_type: Optional[str] = None,
    status: Optional[str] = "active",
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """
    Get pet reports with optional filters and search.
    Search queries across: pet_name, breed, location, description, and tags.
    Returns reports with image URLs ready for carousel display.
    """
    try:
        # Build query
        query = {}
        if report_type:
            query["report_type"] = report_type
        if pet_type:
            query["pet_type"] = pet_type
        if status:
            query["status"] = status
        
        # Fetch reports
        reports = await PetReport.find(query).skip(skip).limit(limit).sort(-PetReport.created_at).to_list()
        
        # Convert to response format and apply search filter if provided
        result = []
        search_lower = search.lower() if search else None
        
        for report in reports:
            # Apply search filter (case-insensitive)
            if search_lower:
                searchable_text = " ".join([
                    report.pet_name or "",
                    report.tags.breed or "",
                    report.user_info.location or "",
                    report.description or "",
                    report.tags.primary_color or "",
                    report.tags.species or "",
                    " ".join(report.tags.marks) if report.tags.marks else ""
                ]).lower()
                
                if search_lower not in searchable_text:
                    continue  # Skip this report if it doesn't match search
            
            # Check if this report has been matched (has an accepted match)
            report_id_str = str(report.id)
            has_accepted_match = await PetMatch.find_one({
                "$or": [
                    {"lost_report_id": report_id_str},
                    {"found_report_id": report_id_str}
                ],
                "status": "accepted"
            }) is not None
            
            result.append({
                "report_id": report_id_str,
                "report_type": report.report_type,
                "pet_name": report.pet_name or "Unknown",
                "pet_type": report.pet_type,
                "image_urls": report.image_urls if report.image_urls else [],  # List for carousel
                "image_count": len(report.image_urls) if report.image_urls else 0,
                "tags": {
                    "species": report.tags.species,
                    "breed": report.tags.breed,
                    "primary_color": report.tags.primary_color,
                    "age_group": report.tags.age_group,
                    "size": report.tags.size,
                    "marks": report.tags.marks
                },
                "location": report.user_info.location,
                "description": report.description or "",
                "status": report.status,
                "is_matched": has_accepted_match,  # True if this report has an accepted match
                "created_at": report.created_at.isoformat()
            })
        
        return {
            "status": "success",
            "count": len(result),
            "reports": result
        }
    except Exception as e:
        print(f"❌ Error fetching reports: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    """Get a specific pet report by ID with all details including image carousel URLs."""
    try:
        from bson import ObjectId
        from bson.errors import InvalidId
        
        try:
            report = await PetReport.get(ObjectId(report_id))
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid report ID format")
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            "status": "success",
            "report": {
                "report_id": str(report.id),
                "report_type": report.report_type,
                "pet_name": report.pet_name,
                "pet_type": report.pet_type,
                "image_urls": report.image_urls,  # Full list for carousel
                "image_count": len(report.image_urls),
                "tags": {
                    "species": report.tags.species,
                    "breed": report.tags.breed,
                    "primary_color": report.tags.primary_color,
                    "age_group": report.tags.age_group,
                    "size": report.tags.size,
                    "marks": report.tags.marks
                },
                "user_info": {
                    "name": report.user_info.name,
                    "email": report.user_info.email,
                    "phone": report.user_info.phone,
                    "location": report.user_info.location
                },
                "description": report.description,
                "status": report.status,
                "created_at": report.created_at.isoformat(),
                "updated_at": report.updated_at.isoformat()
            }
        }
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Report not found")
        print(f"❌ Error fetching report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/matches")
async def get_matches(
    report_id: Optional[str] = None,
    status: Optional[str] = "pending",
    limit: int = 50
):
    """
    Get pet matches. If report_id is provided, get matches for that specific report.
    Otherwise, get all pending matches.
    """
    try:
        query = {"status": status}
        
        if report_id:
            # Get matches where this report is either lost or found
            query["$or"] = [
                {"lost_report_id": report_id},
                {"found_report_id": report_id}
            ]
        
        matches = await PetMatch.find(query).limit(limit).sort(-PetMatch.created_at).to_list()
        
        # Fetch full report details for each match
        result = []
        for match in matches:
            try:
                from bson import ObjectId
                lost_report = await PetReport.get(ObjectId(match.lost_report_id))
                found_report = await PetReport.get(ObjectId(match.found_report_id))
                
                if lost_report and found_report:
                    result.append({
                        "match_id": str(match.id),
                        "lost_report": {
                            "report_id": str(lost_report.id),
                            "pet_name": lost_report.pet_name,
                            "pet_type": lost_report.pet_type,
                            "image_urls": lost_report.image_urls,
                            "tags": {
                                "species": lost_report.tags.species,
                                "breed": lost_report.tags.breed,
                                "primary_color": lost_report.tags.primary_color,
                                "age_group": lost_report.tags.age_group,
                                "size": lost_report.tags.size,
                                "marks": lost_report.tags.marks
                            },
                            "location": lost_report.user_info.location,
                            "description": lost_report.description,
                            "created_at": lost_report.created_at.isoformat()
                        },
                        "found_report": {
                            "report_id": str(found_report.id),
                            "pet_name": found_report.pet_name,
                            "pet_type": found_report.pet_type,
                            "image_urls": found_report.image_urls,
                            "tags": {
                                "species": found_report.tags.species,
                                "breed": found_report.tags.breed,
                                "primary_color": found_report.tags.primary_color,
                                "age_group": found_report.tags.age_group,
                                "size": found_report.tags.size,
                                "marks": found_report.tags.marks
                            },
                            "location": found_report.user_info.location,
                            "description": found_report.description,
                            "created_at": found_report.created_at.isoformat()
                        },
                        "match_score": match.match_score,
                        "matched_tags": match.matched_tags,
                        "status": match.status,
                        "created_at": match.created_at.isoformat()
                    })
            except Exception as e:
                print(f"⚠️ Error fetching match details: {str(e)}")
                continue
        
        return {
            "status": "success",
            "count": len(result),
            "matches": result
        }
    except Exception as e:
        print(f"❌ Error fetching matches: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/matches/{match_id}/decision")
async def handle_match_decision(
    match_id: str,
    decision: str  # "accept" or "reject" - required query parameter
):
    """
    Handle match decision - accept or reject a match.
    Accepts decision as query parameter: ?decision=accept or ?decision=reject
    When accepted, updates the Lost pet report status to "found".
    """
    try:
        from bson import ObjectId
        from bson.errors import InvalidId
        
        try:
            match = await PetMatch.get(ObjectId(match_id))
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid match ID")
        
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        if match.status != "pending":
            raise HTTPException(status_code=400, detail=f"Match already {match.status}")
        
        # Update match status
        decision_lower = decision.lower() if decision else "reject"
        if decision_lower == "accept":
            match.status = "accepted"
            
            # Update the Lost pet report status to "found"
            try:
                lost_report = await PetReport.get(ObjectId(match.lost_report_id))
                if lost_report:
                    lost_report.status = "found"
                    lost_report.updated_at = datetime.utcnow()
                    await lost_report.save()
                    print(f"✅ Updated Lost report {match.lost_report_id} status to 'found'")
            except Exception as e:
                print(f"⚠️ Error updating report status: {str(e)}")
                
        elif decision_lower == "reject":
            match.status = "rejected"
        else:
            raise HTTPException(status_code=400, detail="Decision must be 'accept' or 'reject'")
        
        match.decision_made_by = "current_user"  # TODO: Get from auth token
        match.decision_made_at = datetime.utcnow()
        match.updated_at = datetime.utcnow()
        
        await match.save()
        
        return {
            "status": "success",
            "message": f"Match {decision_lower}ed successfully",
            "match": {
                "match_id": str(match.id),
                "status": match.status,
                "decision_made_at": match.decision_made_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error handling match decision: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
