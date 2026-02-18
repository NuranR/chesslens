import boto3
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from config import settings
from auth import get_current_user
import models

router = APIRouter()

# Initialize the AWS S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """Uploads a chessboard image to AWS S3 and returns the public URL."""
    # 1. Validate it's actually an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image format (jpeg, png, etc.)")

    # 2. Generate a secure, unique filename (e.g., username/1234-abcd.png)
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"boards/{current_user.username}/{uuid.uuid4()}.{file_extension}"

    try:
        # 3. Upload the file stream to S3
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        
        # 4. Construct the final URL
        s3_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"
        
        return {
            "message": "Image successfully uploaded to S3", 
            "image_url": s3_url
        }
        
    except Exception as e:
        print(f"AWS S3 Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to cloud storage.")