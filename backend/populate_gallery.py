#!/usr/bin/env python3
"""
Automated script to populate the gallery with scraped images.
Downloads images from S3, runs AI analysis, and creates pet reports in MongoDB.
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import PetReport, PetTags, UserInfo
from ai_service import analyze_pet_image
from s3_config import s3_client

load_dotenv()

# Sample locations for variety
SAMPLE_LOCATIONS = [
    "Brooklyn, NY", "Manhattan, NY", "Queens, NY", "Bronx, NY",
    "Staten Island, NY", "Jersey City, NJ", "Newark, NJ", 
    "Hoboken, NJ", "Long Island, NY", "Westchester, NY"
]

SAMPLE_USERS = [
    {"name": "Community Helper", "email": "helper1@petfinder.com", "phone": "555-0101"},
    {"name": "Pet Rescuer", "email": "rescuer@petfinder.com", "phone": "555-0102"},
    {"name": "Animal Lover", "email": "lover@petfinder.com", "phone": "555-0103"},
    {"name": "Good Samaritan", "email": "samaritan@petfinder.com", "phone": "555-0104"},
    {"name": "Pet Finder", "email": "finder@petfinder.com", "phone": "555-0105"},
]

async def download_image_from_url(url: str) -> tuple[bytes, str]:
    """Download image from S3 URL and return bytes and content type"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            content_type = response.headers.get('content-type', 'image/jpeg')
            return response.content, content_type
    except Exception as e:
        print(f"❌ Error downloading {url}: {str(e)}")
        raise

async def create_pet_report_from_image(image_url: str, report_type: str = "Found", index: int = 0):
    """Download image, analyze with AI, and create a pet report"""
    try:
        print(f"\n📸 Processing image {index + 1}: {image_url[:60]}...")
        
        # 1. Download image from S3
        print("   1️⃣ Downloading image from S3...")
        image_bytes, mime_type = await download_image_from_url(image_url)
        print(f"      ✅ Downloaded {len(image_bytes)} bytes")
        
        # 2. Run AI analysis
        print("   2️⃣ Analyzing image with AI...")
        try:
            tags_data = await analyze_pet_image(image_bytes, mime_type)
            print(f"      ✅ AI Results: {tags_data.get('species')}, {tags_data.get('breed')}, {tags_data.get('primary_color')}")
            # Ensure all required fields are present
            if "size" not in tags_data:
                tags_data["size"] = "Unknown"
        except Exception as e:
            print(f"      ⚠️  AI analysis failed: {str(e)}")
            tags_data = {
                "species": "Unknown", "breed": "Mixed", "primary_color": "Unknown",
                "age_group": "Adult", "marks": [], "size": "Unknown"
            }
        
        # 3. Determine pet type from species
        pet_type = tags_data.get('species', 'Unknown')
        if pet_type.lower() in ['dog', 'puppy']:
            pet_type = 'Dog'
        elif pet_type.lower() in ['cat', 'kitten']:
            pet_type = 'Cat'
        else:
            pet_type = 'Other'
        
        # 4. Create user info
        user_data = SAMPLE_USERS[index % len(SAMPLE_USERS)]
        location = SAMPLE_LOCATIONS[index % len(SAMPLE_LOCATIONS)]
        
        user_info = UserInfo(
            name=user_data["name"],
            email=user_data["email"],
            phone=user_data["phone"],
            location=location
        )
        
        # 5. Create pet report
        report = PetReport(
            user_id="scraper_bot",
            report_type=report_type,
            pet_name=None,
            pet_type=pet_type,
            user_info=user_info,
            image_urls=[image_url],
            tags=PetTags(**tags_data),
            description=f"Found pet - {tags_data.get('breed', 'Unknown breed')} {tags_data.get('primary_color', '')} {tags_data.get('species', 'pet')}"
        )
        
        # 6. Save to MongoDB
        await report.insert()
        print(f"   3️⃣ ✅ Saved to MongoDB with ID: {report.id}")
        
        return report
        
    except Exception as e:
        print(f"   ❌ Error creating report: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def get_existing_s3_urls_from_bucket(bucket_name: str, prefix: str = "scraped-images/", limit: int = 10):
    """Get existing S3 URLs from the scraped-images bucket"""
    try:
        print(f"📦 Listing objects from S3 bucket: {bucket_name} (prefix: {prefix})")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            MaxKeys=limit * 2  # Get more to account for folders
        )
        
        if 'Contents' not in response:
            print("⚠️  No objects found in scraped-images bucket")
            return []
        
        # Filter for image files and build URLs
        s3_urls = []
        region = os.getenv("AWS_REGION", "us-east-1")
        
        for obj in response['Contents']:
            key = obj['Key']
            # Skip map images - filter out any images that might be maps
            if 'map' in key.lower():
                continue
            # Only include actual image files (not folders)
            if any(key.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
                s3_urls.append(url)
                if len(s3_urls) >= limit:
                    break
        
        print(f"✅ Found {len(s3_urls)} existing images in S3")
        return s3_urls
        
    except Exception as e:
        print(f"❌ Error listing S3 objects: {str(e)}")
        return []

async def populate_gallery(num_images: int = 10, report_type: str = "Found"):
    """Main function to use existing S3 images, analyze them, and populate the gallery."""
    print(f"🚀 Starting gallery population process...")
    print(f"📊 Target: {num_images} pet reports")
    print(f"📝 Report type: {report_type}\n")
    
    # Initialize MongoDB
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        await init_beanie(database=client["SlugHacks"], document_models=[PetReport])
        print("✅ Connected to MongoDB\n")
    except Exception as e:
        print(f"❌ MongoDB connection error: {str(e)}")
        return
    
    # Step 1: Get existing S3 URLs from scraped-images bucket
    print("=" * 60)
    print("STEP 1: Getting existing images from S3 scraped-images bucket")
    print("=" * 60)
    bucket_name = os.getenv("S3_BUCKET_NAME")
    if not bucket_name:
        print("❌ S3_BUCKET_NAME not set in environment variables")
        return
    
    s3_urls = get_existing_s3_urls_from_bucket(bucket_name, limit=num_images)
    
    if not s3_urls or len(s3_urls) == 0:
        print("❌ No images found in S3 scraped-images bucket. Cannot proceed.")
        print("   Make sure you've run the scraper first to upload images to S3.")
        return
    
    # Step 2: Process each image and create pet reports
    print("\n" + "=" * 60)
    print(f"STEP 2: Processing {len(s3_urls)} images with AI and creating reports")
    print("=" * 60)
    
    created_reports = []
    failed_count = 0
    
    for i, s3_url in enumerate(s3_urls):
        try:
            report = await create_pet_report_from_image(s3_url, report_type, i)
            created_reports.append(report)
            await asyncio.sleep(1)  # Rate limiting for AI calls
        except Exception as e:
            print(f"   ❌ Failed to create report for image {i + 1}: {str(e)}")
            failed_count += 1
            continue
    
    # Summary
    print("\n" + "=" * 60)
    print("✨ GALLERY POPULATION COMPLETE!")
    print("=" * 60)
    print(f"✅ Successfully created: {len(created_reports)} pet reports")
    print(f"❌ Failed: {failed_count} reports")
    print(f"📊 Total processed: {len(s3_urls)} images")
    print("\n🎉 Your gallery is now populated with pet reports!")

if __name__ == "__main__":
    asyncio.run(populate_gallery(num_images=10, report_type="Found"))
