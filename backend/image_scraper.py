#!/usr/bin/env python3
"""
Web scraper to download pet images and upload them directly to S3.
Scrapes 10 pet images from Unsplash (free stock photos).
"""

import os
import asyncio
import httpx
from dotenv import load_dotenv
from uuid import uuid4
from s3_config import upload_to_s3

load_dotenv()

# Unsplash API endpoint for pet images (using their source API)
UNSPLASH_PET_IMAGES = [
    "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop",  # Golden Retriever
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop",  # Cat
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=800&fit=crop",  # Dog
    "https://images.unsplash.com/photo-1517849845537-4d58f9986e42?w=800&h=800&fit=crop",  # Cat
    "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=800&fit=crop",  # Beagle
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=800&fit=crop",  # Dog
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop",  # Cat
    "https://images.unsplash.com/photo-1517849845537-4d58f9986e42?w=800&h=800&fit=crop",  # Cat
    "https://images.unsplash.com/photo-1534361960057-19889c4d8c0b?w=800&h=800&fit=crop",  # Dog
    "https://images.unsplash.com/photo-1517849845537-4d58f9986e42?w=800&h=800&fit=crop",  # Cat
]

async def download_image(url: str, index: int) -> tuple[bytes, str]:
    """Download an image from URL and return bytes and filename"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # Determine file extension from content type or default to jpg
            content_type = response.headers.get('content-type', 'image/jpeg')
            ext = 'jpg'
            if 'png' in content_type:
                ext = 'png'
            elif 'webp' in content_type:
                ext = 'webp'
            
            filename = f"scraped_pet_{index + 1}.{ext}"
            return response.content, filename
    except Exception as e:
        print(f"❌ Error downloading image {index + 1}: {str(e)}")
        raise

async def scrape_and_upload_images(num_images: int = 10):
    """Scrape pet images and upload them directly to S3"""
    bucket_name = os.getenv("S3_BUCKET_NAME")
    
    if not bucket_name:
        print("❌ S3_BUCKET_NAME not set in environment variables")
        return
    
    print(f"🕷️  Starting web scraper to download {num_images} pet images...")
    print(f"📦 Target S3 bucket: {bucket_name}\n")
    
    uploaded_urls = []
    
    # Process images concurrently
    tasks = []
    for i in range(min(num_images, len(UNSPLASH_PET_IMAGES))):
        tasks.append(download_image(UNSPLASH_PET_IMAGES[i], i))
    
    # Download all images
    print("📥 Downloading images...")
    download_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Upload each image to S3
    print("\n☁️  Uploading images to S3...")
    for i, result in enumerate(download_results):
        if isinstance(result, Exception):
            print(f"   ❌ Image {i + 1}: Failed to download - {str(result)}")
            continue
        
        image_bytes, filename = result
        try:
            # Create S3 object key
            object_key = f"scraped-images/{uuid4()}/{filename}"
            
            # Upload to S3
            image_url = await upload_to_s3(
                image_bytes,
                bucket_name,
                object_key
            )
            
            uploaded_urls.append(image_url)
            print(f"   ✅ Image {i + 1}: {filename} → {image_url}")
        except Exception as e:
            print(f"   ❌ Image {i + 1}: Failed to upload - {str(e)}")
    
    print(f"\n✨ Completed! Successfully uploaded {len(uploaded_urls)}/{num_images} images to S3")
    print("\n📋 Uploaded URLs:")
    for i, url in enumerate(uploaded_urls, 1):
        print(f"   {i}. {url}")
    
    return uploaded_urls

if __name__ == "__main__":
    asyncio.run(scrape_and_upload_images(10))
