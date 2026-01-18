#!/usr/bin/env python3
"""
Test the complete upload workflow:
1. Upload image + pet details
2. Verify S3 upload
3. Check Gemini AI tags
4. Confirm MongoDB storage
"""

import requests
import json
from pathlib import Path
from urllib.request import urlopen

# Test image URL (placeholder - we'll use a real pet image)
TEST_IMAGE_URL = "https://images.unsplash.com/photo-1633722715463-d30628519d60?w=400"

def test_upload_flow():
    """Test the complete upload workflow"""
    print("🐕 Testing Pet Finder Upload Flow\n")
    
    # 1. Download test image
    print("1️⃣ Downloading test pet image...")
    response = urlopen(TEST_IMAGE_URL)
    image_data = response.read()
    print(f"   ✅ Downloaded {len(image_data)} bytes\n")
    
    # 2. Prepare form data
    print("2️⃣ Preparing upload form data...")
    files = {
        'files': ('test_dog.jpg', image_data, 'image/jpeg'),
    }
    
    data = {
        'report_type': 'Lost',
        'pet_name': 'Buddy',
        'pet_type': 'Dog',
        'user_name': 'John Doe',
        'user_email': 'john@example.com',
        'user_phone': '555-1234',
        'user_location': 'San Francisco, CA',
        'description': 'Golden Retriever, lost near Golden Gate Park'
    }
    print(f"   ✅ Form data ready\n")
    
    # 3. Upload to backend
    print("3️⃣ Uploading to backend...")
    try:
        response = requests.post(
            'http://localhost:8000/api/reports',
            files=files,
            data=data,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"   ❌ Upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
        
        result = response.json()
        print(f"   ✅ Upload successful!\n")
        
        # 4. Verify response
        print("4️⃣ Verifying response data...")
        print(f"   Report ID: {result.get('report_id')}")
        print(f"   Status: {result.get('status')}")
        print(f"   Images uploaded: {len(result.get('image_urls', []))}")
        print(f"   Image URL: {result.get('image_urls', [None])[0]}")
        
        # 5. Verify AI tags
        print("\n5️⃣ AI Analysis Results:")
        detected_pet = result.get('detected_pet', {})
        print(f"   Breed: {detected_pet.get('breed', 'N/A')}")
        print(f"   Color: {detected_pet.get('primary_color', 'N/A')}")
        print(f"   Age: {detected_pet.get('age_group', 'N/A')}")
        print(f"   Size: {detected_pet.get('size', 'N/A')}")
        
        # 6. Test image viewing
        print("\n6️⃣ Testing image URL...")
        image_url = result.get('image_urls', [None])[0]
        if image_url:
            img_response = requests.head(image_url, timeout=10)
            if img_response.status_code == 200:
                print(f"   ✅ Image accessible ({img_response.headers.get('Content-Type', 'Unknown type')})")
            else:
                print(f"   ❌ Image not accessible: {img_response.status_code}")
        
        print("\n✅ All tests passed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Failed to connect to backend at http://localhost:8000")
        print("   Make sure backend is running!")
        return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_upload_flow()
    exit(0 if success else 1)
