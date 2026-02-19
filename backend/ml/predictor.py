import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import os

class ChessPredictor:
    def __init__(self, model_path: str):
        print(f"Loading TFLite model from: {model_path}")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")

        # Initialize TFLite Interpreter
        self.interpreter = tf.lite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

        # Constants matching your training logic
        self.BOARD_SIZE = 400
        self.SQUARE_SIZE = 50
        
        # Mapping from model output index to FEN character
        self.PIECE_MAP = {
            0: '1',   # Empty square
            1: 'P', 2: 'N', 3: 'B', 4: 'R', 5: 'Q', 6: 'K',  # White pieces
            7: 'p', 8: 'n', 9: 'b', 10: 'r', 11: 'q', 12: 'k'  # Black pieces
        }

    def predict(self, image_path: str) -> str:
        """
        Main entry point: Takes an image path, returns a FEN string.
        """
        # 1. Load and Preprocess Image
        img = Image.open(image_path).convert('RGB')
        
        # Force resize to 400x400 so your slicing logic works perfectly
        img = img.resize((self.BOARD_SIZE, self.BOARD_SIZE))
        
        # 2. Extract the 64 squares
        squares = self._extract_squares(img)
        
        # 3. Run Inference on all squares
        predictions = self._run_batch_inference(squares)
        
        # 4. Convert predictions to FEN
        fen = self._to_fen(predictions)
        
        # 5. Add default turn info (White to move, full castling rights)
        return f"{fen} w KQkq - 0 1"

    def _extract_squares(self, img):
        # Convert PIL to numpy (RGB)
        img_array = np.array(img)
        
        # Convert to Grayscale (Model expects 1 channel?)
        # CHECK: Your previous code converted to gray. I'll keep that logic.
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array

        squares = []
        for row in range(8):
            for col in range(8):
                y_start = row * self.SQUARE_SIZE
                y_end = (row + 1) * self.SQUARE_SIZE
                x_start = col * self.SQUARE_SIZE
                x_end = (col + 1) * self.SQUARE_SIZE
                
                square = gray[y_start:y_end, x_start:x_end]
                squares.append(square)
        return squares

    def _run_batch_inference(self, squares):
        predictions = []
        
        # Iterate through all 64 squares
        for square in squares:
            # Preprocess: Normalize to 0-1 and reshape
            img_array = square.astype('float32') / 255.0
            
            # Add channel dimension (H, W, 1) -> TFLite likely needs (1, H, W, 1)
            img_array = np.expand_dims(img_array, axis=-1) 
            img_array = np.expand_dims(img_array, axis=0)  # Batch dimension
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], img_array)
            self.interpreter.invoke()
            
            # Get output
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            predicted_class = np.argmax(output_data)
            predictions.append(predicted_class)
            
        return predictions

    def _to_fen(self, predictions):
        fen = ""
        for row in range(8):
            empty_count = 0
            # Get the 8 predictions for this rank
            row_preds = predictions[row * 8 : (row + 1) * 8]
            
            for pred in row_preds:
                piece = self.PIECE_MAP.get(pred, '1')
                
                if piece == '1':
                    empty_count += 1
                else:
                    if empty_count > 0:
                        fen += str(empty_count)
                        empty_count = 0
                    fen += piece
            
            if empty_count > 0:
                fen += str(empty_count)
                
            if row < 7:
                fen += '/'
        return fen