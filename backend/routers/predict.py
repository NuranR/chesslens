from fastapi import APIRouter, UploadFile, File, HTTPException, Request
import shutil
import os


router = APIRouter()

@router.post("/predict")
async def predict_fen(request: Request, file: UploadFile = File(...)):
    # 1. Grab the model from the app state backpack
    model = getattr(request.app.state, "piece_classifier", None)
    
    if model is None:
        raise HTTPException(status_code=503, detail="AI Model is not ready yet.")

    # 2. Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG/PNG allowed.")

    try:
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Run Inference
        real_fen = model.predict(temp_filename)
        
        # 4. Cleanup
        os.remove(temp_filename)
        
        return {
            "fen": real_fen,
            "lichess_url": f"https://lichess.org/editor/{real_fen.replace(' ', '_')}"
        }

    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")