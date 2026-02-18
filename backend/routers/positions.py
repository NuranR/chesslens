from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.PositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(
    position: schemas.PositionCreate, 
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save a new chess position to the user's library."""
    new_position = models.Position(
        **position.model_dump(),
        user_id=current_user.id
    )
    db.add(new_position)
    await db.commit()
    await db.refresh(new_position)
    return new_position

@router.get("/", response_model=List[schemas.PositionResponse])
async def get_positions(
    category: Optional[str] = Query(None, description="Filter by category (e.g., Endgames)"),
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all saved positions for the logged-in user, newest first."""
    query = select(models.Position).where(models.Position.user_id == current_user.id)
    
    if category:
        query = query.where(models.Position.category == category)
        
    # Order by newest first
    query = query.order_by(desc(models.Position.created_at))
    
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{position_id}", response_model=schemas.PositionResponse)
async def update_position(
    position_id: int,
    update_data: schemas.PositionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a position's category or notes."""
    # 1. Find the specific position owned by this user
    query = select(models.Position).where(
        models.Position.id == position_id,
        models.Position.user_id == current_user.id
    )
    result = await db.execute(query)
    position = result.scalars().first()

    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    # 2. Extract only the fields the user actually sent in the request
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # 3. Apply those updates to the database object
    for key, value in update_dict.items():
        setattr(position, key, value)

    await db.commit()
    await db.refresh(position)
    return position

@router.delete("/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_position(
    position_id: int, 
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific position."""
    query = select(models.Position).where(
        models.Position.id == position_id, 
        models.Position.user_id == current_user.id
    )
    result = await db.execute(query)
    position = result.scalars().first()
    
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")
        
    await db.delete(position)
    await db.commit()
    return None