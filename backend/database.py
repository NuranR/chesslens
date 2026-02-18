from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# 1. Create the async engine
# echo=True will print all SQL queries to the terminal
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# 2. Create a session factory
# This will spawn a new database session for every request
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 3. Create the declarative base
# All database models (Users, Positions) will inherit from this class
Base = declarative_base()

# 4. Dependency to get the database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session