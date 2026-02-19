import { useState } from "react";
import ChessboardDropzone from "../components/ChessboardDropzone";
import { predictBoard, saveBoardToLibrary } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleAnalyzeBoard = async (file: File) => {
    setIsAnalyzing(true);

    try {
      // 1. Get Prediction
      const data = await predictBoard(file);

      // 2. Open Lichess immediately
      window.open(data.lichess_url, "_blank", "noopener,noreferrer");

      // 3. Save & Redirect
      if (isLoggedIn) {
        try {
          // Wait for the save to complete so we get the ID
          const savedBoard = await saveBoardToLibrary(file, data.fen);
          console.log("Saved!", savedBoard);

          // Redirect to the new Details page
          navigate(`/board/${savedBoard.id}`);
        } catch (saveError) {
          console.error("Background save failed:", saveError);
        }
      }
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Failed to analyze the board. Ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <header className="mb-12">
          <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
            Scan. Analyze. <span className="text-sky-400">Win.</span>
          </h2>
          <p className="text-gray-400 text-lg"></p>
        </header>

        {/* The Drag & Drop Component handles the preview and button internally */}
        <ChessboardDropzone
          onAnalyze={handleAnalyzeBoard}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}
