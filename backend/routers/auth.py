from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Import our local modules
import models
import schemas
import auth
from database import get_db

# Create the router instance
router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user. Checks if username or email already exists.
    """
    # 1. Check if username or email is already taken
    query = select(models.User).where(
        (models.User.username == user.username) | (models.User.email == user.email)
    )
    result = await db.execute(query)
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # 2. Hash the password
    hashed_password = auth.get_password_hash(user.password)
    
    # 3. Create and save the new user
    new_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return a JWT token.
    """
    # 1. Find the user by username
    query = select(models.User).where(models.User.username == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()

    # 2. Verify user exists and password is correct
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Generate the JWT token
    access_token = auth.create_access_token(data={"sub": user.username})
    
    # 4. Return standard OAuth2 token response
    return {"access_token": access_token, "token_type": "bearer"}