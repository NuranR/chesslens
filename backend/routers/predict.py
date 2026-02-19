from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import shutil
import os

from main import ml_models

router = APIRouter()

@router.post("/predict")
async def predict_fen(request: Request, file: UploadFile = File(...)):
    # 1. Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG/PNG allowed.")
    
    # # 2. Grab the model from the global state
    # model = request.state.ml_models.get("chess_net") # Or access via app.state if using that pattern
    # # Note: With the lifespan defined above, you usually access it via global variable or dependency injection.
    # # Let's keep it simple for now:
    # from main import ml_models 
    
    # if not ml_models.get("chess_net"):
    #     raise HTTPException(status_code=503, detail="AI Model is not ready yet.")
    
    # Check if model is loaded
    if ml_models.get("piece_classifier") is None:
         raise HTTPException(status_code=503, detail="AI Model is missing on server.")

    try:
        # 3. Save the uploaded file temporarily (TensorFlow usually needs a path or bytes)
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 4. RUN YOUR ML INFERENCE HERE
        # real_fen = ml_models["chess_net"].predict(temp_filename)
        
        # MOCK RESPONSE FOR TESTING FRONTEND
        print(f"Processing image: {temp_filename}")
        mock_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        
        # 5. Cleanup
        os.remove(temp_filename)
        
        return {
            "fen": mock_fen,
            "lichess_url": f"https://lichess.org/analysis/{mock_fen.replace(' ', '_')}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")