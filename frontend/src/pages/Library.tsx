import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserLibrary, deleteBoardFromLibrary } from "../services/api";

interface SavedBoard {
  id: string | number;
  fen: string;
  image_path: string;
  category?: string; // Made optional just in case
  created_at: string;
}

export default function Library() {
  const [boards, setBoards] = useState<SavedBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. New State for the Filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const data = await getUserLibrary();
      setBoards(data);
    } catch (err) {
      console.error("Failed to fetch library", err);
      setError("Failed to load your saved games.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const previousBoards = [...boards];
    setBoards(boards.filter((board) => board.id !== id));

    try {
      await deleteBoardFromLibrary(id);
    } catch (err) {
      console.error("Failed to delete board:", err);
      setBoards(previousBoards);
      alert("Failed to delete the board. Ensure the server is running.");
    }
  };

  // 2. The Filter Logic (Client-side is instant!)
  const filteredBoards =
    selectedCategory === "All"
      ? boards
      : boards.filter(
          (b) => (b.category || "Uncategorized") === selectedCategory,
        );

  if (isLoading)
    return (
      <div className="text-center mt-20 text-gray-400">
        Loading your vault...
      </div>
    );
  if (error)
    return <div className="text-center mt-20 text-red-400">{error}</div>;

  return (
    <div className="mt-8 px-4 md:px-0">
      {/* Header with Flexbox for Title and Dropdown */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-700 pb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            My <span className="text-sky-400">Library</span>
          </h2>
        </div>

        {/* 3. The Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-gray-400 text-sm font-bold uppercase tracking-wider">
            Filter by:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-sky-500 focus:outline-none shadow-sm hover:border-gray-500 transition-colors cursor-pointer"
          >
            <option value="All">All</option>
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
      </header>

      {/* Grid displays filteredBoards instead of boards */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
          <p className="text-gray-400 text-lg">
            {boards.length === 0
              ? "You haven't scanned any boards yet."
              : `No boards found in "${selectedCategory}".`}
          </p>
          {boards.length > 0 && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 text-sky-400 hover:text-sky-300 font-bold"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-sky-500/50 transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] flex flex-col group"
            >
              {/* Image Link to Edit Page */}
              <Link
                to={`/board/${board.id}`}
                className="block relative aspect-square bg-gray-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={board.image_path}
                  alt="Chessboard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold border border-white/30 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                    Edit Position
                  </span>
                </div>
                {/* Category Badge on Image */}
                <div className="absolute top-3 right-3">
                  <span className="bg-black/70 backdrop-blur-md text-sky-400 text-xs font-bold px-2 py-1 rounded border border-white/10">
                    {board.category || "Uncategorized"}
                  </span>
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs text-gray-400 mb-2 flex justify-between">
                  <span>{new Date(board.created_at).toLocaleDateString()}</span>
                  <span className="text-gray-500">#{board.id}</span>
                </p>
                <div className="bg-gray-900 p-2 rounded border border-gray-700 mb-4 overflow-hidden relative group/fen">
                  <p className="text-xs text-gray-300 font-mono truncate">
                    {board.fen}
                  </p>
                  {/* Tiny visual hint that it's truncated */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent"></div>
                </div>

                <div className="mt-auto flex gap-2">
                  <a
                    href={`https://lichess.org/editor/${board.fen.replace(/ /g, "_")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-sky-500/10 text-sky-400 font-bold py-2 rounded border border-sky-500/50 hover:bg-sky-500/20 transition-colors text-sm"
                  >
                    Analyze
                  </a>
                  <button
                    onClick={() => handleDelete(board.id)}
                    className="px-3 bg-red-500/10 text-red-500 font-bold rounded border border-red-500/50 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                    title="Delete Board"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
