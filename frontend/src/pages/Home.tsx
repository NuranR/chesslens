import { useState } from "react";
import ChessboardDropzone from "../components/ChessboardDropzone";
import { predictBoard } from "../services/api"; // Import the new API function

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeBoard = async (file: File) => {
    setIsAnalyzing(true);

    try {
      // 1. Send the file to your FastAPI backend
      const data = await predictBoard(file);

      console.log("AI Prediction FEN:", data.fen);

      // 2. Snap open the Lichess board editor in a new tab!
      window.open(data.lichess_url, "_blank", "noopener,noreferrer");
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
