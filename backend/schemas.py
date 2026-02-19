from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# ==========================================
# POSITION SCHEMAS
# ==========================================

class PositionBase(BaseModel):
    fen: str
    category: Optional[str] = None
    notes: Optional[str] = None
    image_path: Optional[str] = None

class PositionCreate(PositionBase):
    """Schema for receiving data to create a new position."""
    pass

class PositionUpdate(BaseModel):
    """Schema for updating an existing position. All fields optional."""
    fen: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class PositionResponse(PositionBase):
    """Schema for returning position data to the frontend."""
    id: int
    user_id: int
    created_at: datetime

    # This tells Pydantic to read data even if it's an ORM model, not just a dict
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# USER SCHEMAS
# ==========================================

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    """Schema for user registration (requires password)."""
    password: str

class UserResponse(UserBase):
    """Schema for returning user data (STRIPS OUT PASSWORD)."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)