import boto3
import os
from dotenv import load_dotenv
from uuid import uuid4
import mimetypes

load_dotenv()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1")
)

# Mock storage for testing when S3 is unavailable
MOCK_STORAGE = {}

def get_s3_presigned_url(bucket_name: str, object_key: str, expiration: int = 3600) -> str:
    """Generate a pre-signed URL for direct S3 upload"""
    try:
        url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=expiration
        )
        return url
    except Exception as e:
        raise Exception(f"Error generating presigned URL: {str(e)}")

async def upload_to_s3(file_bytes: bytes, bucket_name: str, object_key: str) -> str:
    """Upload file to S3 and return the object URL, with fallback to mock storage"""
    try:
        # Determine content type from file extension
        content_type, _ = mimetypes.guess_type(object_key)
        if not content_type:
            content_type = 'image/jpeg'  # Default to JPEG for pet images
        
        # Upload with correct Content-Type
        s3_client.put_object(
            Bucket=bucket_name, 
            Key=object_key, 
            Body=file_bytes,
            ContentType=content_type
        )
        object_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{object_key}"
        print(f"✅ Uploaded to S3: {object_url}")
        return object_url
    except Exception as e:
        print(f"⚠️ S3 Error: {str(e)}")
        print("🔄 Using mock storage for testing...")
        # Fallback: use mock storage
        mock_id = str(uuid4())
        MOCK_STORAGE[mock_id] = file_bytes
        mock_url = f"mock://storage/{mock_id}/{object_key}"
        print(f"✅ Stored in mock storage: {mock_url}")
        return mock_url

