import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ChessboardDropzone from "../components/ChessboardDropzone";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // This is where we will hook up your FastAPI backend!
  const handleAnalyzeBoard = async (file: File) => {
    setIsAnalyzing(true);
    console.log("File ready for backend:", file.name);

    // TODO: 1. Send file to FastAPI
    // TODO: 2. Get FEN back
    // TODO: 3. Redirect to Lichess

    // Simulating a network request for now
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("Backend connection coming next!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold text-sky-400">ChessLens</h1>
        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="hover:text-sky-400 transition-colors"
              >
                My Library
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 text-red-500 px-4 py-2 rounded border border-red-500/50 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-sky-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-sky-500 px-4 py-2 rounded font-bold hover:bg-sky-600 transition-all"
              >
                Join to Save Games
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto text-center">
        <header className="mb-12">
          <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
            Scan. Analyze. <span className="text-sky-400">Win.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Upload a board photo to get an instant FEN and Lichess analysis.
          </p>
        </header>

        {/* Look how clean this is! */}
        <ChessboardDropzone
          onAnalyze={handleAnalyzeBoard}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}
