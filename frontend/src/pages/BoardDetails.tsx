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
      alert("✅ Changes saved successfully!");
    } catch (error) {
      console.error("Failed to update board", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="text-white text-center mt-20">Loading details...</div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl flex flex-col md:flex-row gap-8">
      {/* Left Column: Image */}
      <div className="w-full md:w-1/2">
        <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-600 shadow-inner">
          <img
            src={imageUrl}
            alt="Chess Board"
            className="w-full h-full object-cover"
          />
        </div>
        <a
          href={`https://lichess.org/editor/${fen.replace(/ /g, "_")}`}
          target="_blank"
          rel="noreferrer"
          className="block w-full text-center mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded transition-colors"
        >
          Open in Lichess
        </a>
      </div>

      {/* Right Column: Form */}
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Edit Position</h2>
          <p className="text-gray-400 text-sm">
            Correct the AI prediction or add notes.
          </p>
        </div>

        {/* FEN Editor */}
        <div>
          <label className="block text-sky-400 font-bold mb-2">
            FEN String
          </label>
          <input
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-gray-200 font-mono text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sky-400 font-bold mb-2">Category</label>
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
          </select>
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-sky-400 font-bold mb-2">Notes</label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was the key idea here? e.g., 'Knight sacrifice on f7...'"
            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
  );
}
