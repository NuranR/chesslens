import { useEffect, useState } from "react";
import { getUserLibrary, deleteBoardFromLibrary } from "../services/api";
import { Link } from "react-router-dom";

interface SavedBoard {
  id: string | number;
  fen: string;
  image_path: string;
  created_at: string;
}

export default function Library() {
  const [boards, setBoards] = useState<SavedBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (isLoading) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Loading your vault...
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-400">{error}</div>;
  }

  const handleDelete = async (id: string | number) => {
    // 1. Save the current state in case the server crashes
    const previousBoards = [...boards];

    // 2. Optimistic Update: Instantly remove it from the screen
    setBoards(boards.filter((board) => board.id !== id));

    try {
      // 3. Tell the backend to delete it from S3 and Postgres
      await deleteBoardFromLibrary(id);
    } catch (err) {
      console.error("Failed to delete board:", err);
      // 4. Rollback the UI if the backend failed
      setBoards(previousBoards);
      alert("Failed to delete the board. Ensure the server is running.");
    }
  };

  return (
    <div className="mt-1">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          My <span className="text-sky-400">Library</span>
        </h2>
        {/* <p className="text-gray-400 mt-2">
          Your scanned boards and analyzed positions.
        </p> */}
      </header>

      {boards.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
          <p className="text-gray-400">You haven't uploaded any images yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-sky-500/50 transition-colors shadow-lg flex flex-col"
            >
              <Link
                to={`/board/${board.id}`}
                className="block relative aspect-square bg-gray-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={board.image_path}
                  alt="Chessboard"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold border border-white/30 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                    Edit / Notes
                  </span>
                </div>
              </Link>

              <div className="p-5 flex flex-col grow">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(board.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-200 font-mono bg-gray-900 p-2 rounded border border-gray-700 break-all mb-4">
                  {board.fen}
                </p>

                <div className="mt-auto flex gap-2">
                  <a
                    href={`https://lichess.org/editor/${board.fen.replace(/ /g, "_")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-sky-500/10 text-sky-400 font-bold py-2 rounded border border-sky-500/50 hover:bg-sky-500/20 transition-colors"
                  >
                    Analyze
                  </a>
                  <button
                    onClick={() => handleDelete(board.id)}
                    className="px-4 bg-red-500/10 text-red-500 font-bold rounded border border-red-500/50 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                    title="Delete Board"
                  >
                    {/* SVG Trash Icon */}
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
