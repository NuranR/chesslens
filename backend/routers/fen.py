import boto3
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form, Depends
from config import settings
from auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
import models
from database import get_db
from sqlalchemy.future import select
from models import Position

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
    fen: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Uploads a chessboard image to AWS S3 and saves it to the user's library."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image format.")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"boards/{current_user.username}/{uuid.uuid4()}.{file_extension}"

    try:
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        
        s3_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_filename}"

        # Create the Database Record
        new_position = models.Position(
            user_id=current_user.id,
            fen=fen,
            image_path=s3_url
        )
        
        # Save to Database
        db.add(new_position)
        await db.commit()        
        await db.refresh(new_position) 
        
        return {
            "message": "Image successfully uploaded and saved to library", 
            "image_url": s3_url,
            "id": new_position.id
        }
        
    except Exception as e:
        print(f"Upload/Database Error: {e}")
        await db.rollback() 
        raise HTTPException(status_code=500, detail="Failed to save board to cloud storage.")
    
@router.get("/library")
async def get_user_library(
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Fetch all positions belonging to the logged-in user, newest first
    query = select(Position).where(Position.user_id == current_user.id).order_by(Position.created_at.desc())
    result = await db.execute(query)
    positions = result.scalars().all()
    
    return positions