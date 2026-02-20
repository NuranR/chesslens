from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from ml.predictor import ChessPredictor 
from routers import auth, positions, fen, predict

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = "ml/piece_classifier_model.tflite"
    
    if os.path.exists(model_path):
        print(f"🧠 Loading ChessLens AI Model from {model_path}...")
        # Attach it to the app's state backpack
        app.state.piece_classifier = ChessPredictor(model_path)
        print("✅ Model loaded successfully.")
    else:
        print(f"⚠️ WARNING: Model not found at {model_path}. AI features will not work.")
        app.state.piece_classifier = None
    
    yield
    
    # Clean up on shutdown
    if getattr(app.state, "piece_classifier", None):
        del app.state.piece_classifier
    print("🛑 Model unloaded.")

# Initialize the FastAPI application
app = FastAPI(
    lifespan=lifespan,
    title="ChessLens API",
    description="Backend for the ChessLens FEN extraction and position management app.",
    version="1.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:5173",          # For local Vite dev
    "https://chesslens.tech",         # Production Frontend
    "https://www.chesslens.tech"      # Production Frontend (www)
]
# Configure CORS to allow frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This mounts all routes from auth.py under the /api/auth prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(positions.router, prefix="/api/positions", tags=["Positions"])
app.include_router(fen.router, prefix="/api/fen", tags=["Image Upload"])
app.include_router(predict.router, prefix="/api/ai", tags=["FEN Extraction"])

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "ChessLens API is ready for your moves."}