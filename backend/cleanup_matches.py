#!/usr/bin/env python3
"""
Cleanup script to remove auto-matched reports created by scraper_bot
"""

import os
import asyncio
from bson import ObjectId
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import PetReport, PetMatch

load_dotenv()

async def cleanup():
    """Remove matches and update status for scraper_bot reports"""
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        await init_beanie(database=client["SlugHacks"], document_models=[PetReport, PetMatch])
        print("✅ Connected to MongoDB\n")
        
        # Find all scraper_bot reports using raw query to avoid validation errors
        db = client["SlugHacks"]
        scraper_report_ids = []
        async for doc in db.pet_reports.find({"user_id": "scraper_bot"}):
            scraper_report_ids.append(str(doc["_id"]))
        
        print(f"Found {len(scraper_report_ids)} scraper_bot reports")
        
        # Find and delete matches involving scraper_bot reports
        deleted_matches = 0
        for report_id in scraper_report_ids:
            matches = await PetMatch.find({
                "$or": [
                    {"lost_report_id": report_id},
                    {"found_report_id": report_id}
                ]
            }).to_list()
            
            for match in matches:
                await match.delete()
                deleted_matches += 1
                print(f"  Deleted match {match.id}")
        
        # Reset status of scraper_bot reports that were set to 'found'
        updated = 0
        for report_id in scraper_report_ids:
            result = await db.pet_reports.update_one(
                {"_id": ObjectId(report_id), "status": "found"},
                {"$set": {"status": "active"}}
            )
            if result.modified_count > 0:
                updated += 1
                print(f"  Reset status for report {report_id}")
        
        print(f"\n✅ Cleanup complete!")
        print(f"   Deleted {deleted_matches} matches")
        print(f"   Reset {updated} report statuses")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(cleanup())
