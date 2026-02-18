from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI application
app = FastAPI(
    title="ChessLens API",
    description="Backend for the ChessLens FEN extraction and position management app.",
    version="1.0.0"
)

# Configure CORS to allow your frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "ChessLens API is ready for your moves."}