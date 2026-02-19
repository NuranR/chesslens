from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routers import auth, positions, fen

from ml.predictor import ChessPredictor 

ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = "ml/piece_classifier_model.tflite" 
    
    if os.path.exists(model_path):
        print(f"🧠 Loading ChessLens AI Model from {model_path}...")
        ml_models["piece_classifier"] = ChessPredictor(model_path)
        print("✅ Model loaded successfully.")
    else:
        print(f"⚠️ WARNING: Model not found at {model_path}. AI features will not work.")
        ml_models["piece_classifier"] = None
    
    yield
    
    ml_models.clear()
    print("🛑 Model unloaded.")

# Initialize the FastAPI application
app = FastAPI(
    lifespan=lifespan,
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

# This mounts all routes from auth.py under the /api/auth prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(positions.router, prefix="/api/positions", tags=["Positions"])
app.include_router(fen.router, prefix="/api/fen", tags=["FEN Extraction"])

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "ChessLens API is ready for your moves."}