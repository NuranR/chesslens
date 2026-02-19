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
from schemas import PositionUpdate

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

@router.delete("/library/{board_id}")
async def delete_saved_board(
    board_id: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deletes a saved board from both PostgreSQL and AWS S3."""
    
    # 1. Find the board in the database and ensure it belongs to the user
    query = select(models.Position).where(
        models.Position.id == board_id, 
        models.Position.user_id == current_user.id
    )
    result = await db.execute(query)
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or unauthorized")
        
    # 2. Extract the S3 Object Key from the URL
    # URL looks like: https://bucket.s3.region.amazonaws.com/boards/user2/uuid.png
    # S3 just wants the key: boards/user2/uuid.png
    try:
        s3_key = board.image_path.split(".amazonaws.com/")[-1]
        s3_client.delete_object(
            Bucket=settings.AWS_BUCKET_NAME,
            Key=s3_key
        )
    except Exception as e:
        print(f"AWS S3 Deletion Error: {e}")
        # Delete from the DB even if S3 fails, so you don't get ghost records in your UI
        
    # 3. Delete from Postgres
    await db.delete(board)
    await db.commit()
    
    return {"message": "Board successfully completely deleted"}

@router.patch("/library/{board_id}")
async def update_saved_board(
    board_id: int,
    board_data: PositionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates a saved board's FEN, category, or notes."""
    
    # 1. Fetch the board and verify ownership
    query = select(models.Position).where(
        models.Position.id == board_id, 
        models.Position.user_id == current_user.id
    )
    result = await db.execute(query)
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or unauthorized")
        
    # 2. Update only the fields the frontend actually sent
    if board_data.fen is not None:
        board.fen = board_data.fen
    if board_data.category is not None:
        board.category = board_data.category
    if board_data.notes is not None:
        board.notes = board_data.notes
        
    # 3. Save the changes to the hard drive
    await db.commit()
    await db.refresh(board)
    
    return {"message": "Board successfully updated", "board_id": board.id}

# To fetch a specific board to edit details
@router.get("/library/{board_id}")
async def get_single_board(
    board_id: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches a single board's details for the edit page."""
    query = select(models.Position).where(
        models.Position.id == board_id, 
        models.Position.user_id == current_user.id
    )
    result = await db.execute(query)
    board = result.scalar_one_or_none()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
        
    return board