import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBoard, updateBoard } from "../services/api";

export default function BoardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fen, setFen] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get 'w' or 'b' from the FEN string
  const getTurn = (fenStr: string) => {
    const parts = fenStr.split(" ");
    return parts.length > 1 ? parts[1] : "w";
  };

  // Helper to update the 'w' or 'b' in the FEN string
  const handleTurnChange = (newTurn: string) => {
    const parts = fen.split(" ");
    if (parts.length > 1) {
      parts[1] = newTurn;
      setFen(parts.join(" "));
    } else {
      // Fallback if FEN is incomplete
      setFen(`${fen} ${newTurn} - - 0 1`);
    }
  };

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        if (!id) return;
        const data = await getBoard(id);
        setFen(data.fen);
        setImageUrl(data.image_path);
        setCategory(data.category || "Uncategorized");
        setNotes(data.notes || "");
      } catch (error) {
        console.error("Failed to load board", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await updateBoard(id, { fen, category, notes });
    } catch (error) {
      console.error("Failed to update board", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
      navigate("/library");
    }
  };

  if (isLoading)
    return (
      <div className="text-white text-center mt-20">Loading details...</div>
    );

  return (
    // Fixed: Added min-h-screen and matching background to remove white gaps
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Image Preview */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-700">
          <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <img
              src={imageUrl}
              alt="Chess Board"
              className="w-full h-full object-contain bg-gray-900"
            />
          </div>
        </div>

        {/* Right Column: Editor Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Edit Position
            </h2>
          </div>

          {/* FEN String Input */}
          <div>
            <label className="block text-sky-400 font-bold mb-2 text-sm uppercase tracking-wider">
              FEN Notation
            </label>
            <input
              type="text"
              value={fen}
              onChange={(e) => setFen(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-gray-200 font-mono text-sm focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>

          {/* Side to Move Radio Buttons */}
          <div>
            <label className="block text-sky-400 font-bold mb-3 text-sm uppercase tracking-wider">
              Side to Move
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTurn(fen) === "w" ? "border-sky-500" : "border-gray-500"}`}
                >
                  {getTurn(fen) === "w" && (
                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  name="turn"
                  className="hidden"
                  checked={getTurn(fen) === "w"}
                  onChange={() => handleTurnChange("w")}
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  White
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${getTurn(fen) === "b" ? "border-sky-500" : "border-gray-500"}`}
                >
                  {getTurn(fen) === "b" && (
                    <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  name="turn"
                  className="hidden"
                  checked={getTurn(fen) === "b"}
                  onChange={() => handleTurnChange("b")}
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  Black
                </span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sky-400 font-bold mb-2 text-sm uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="Tactics">Tactics</option>
              <option value="Opening">Opening</option>
              <option value="Middlegame">Middlegame</option>
              <option value="Endgame">Endgame</option>
              <option value="Blunder">Blunders</option>
              <option value="Puzzle">Puzzle</option>
              <option value="Important">Important</option>
              <option value="Strategy">Strategy</option>
            </select>
          </div>

          {/* Notes */}
          <div className="grow">
            <label className="block text-sky-400 font-bold mb-2 text-sm uppercase tracking-wider">
              Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key ideas, tactics, or mistakes..."
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-sky-500 focus:outline-none h-full min-h-[100px]"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3 mt-6">
            <a
              href={`https://lichess.org/editor/${fen.replace(/ /g, "_")}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-sky-600/20 text-sky-400 border border-sky-500/50 hover:bg-sky-600 hover:text-white font-bold py-3 rounded text-center transition-all flex items-center justify-center gap-2"
            >
              Analyze
            </a>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 shadow-lg shadow-green-900/20"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => navigate("/library")}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
