import { useEffect, useState } from "react";
import { getUserLibrary } from "../services/api";

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

  return (
    <div className="mt-8">
      <header className="mb-10">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          My <span className="text-sky-400">Library</span>
        </h2>
        <p className="text-gray-400 mt-2">
          Your scanned boards and analyzed positions.
        </p>
      </header>

      {boards.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
          <p className="text-gray-400">You haven't scanned any boards yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-sky-500/50 transition-colors shadow-lg flex flex-col"
            >
              {/* S3 Image Preview */}
              <div className="aspect-square bg-gray-900 relative">
                <img
                  src={board.image_path}
                  alt="Chessboard"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex flex-col grow">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(board.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-200 font-mono bg-gray-900 p-2 rounded border border-gray-700 break-all mb-4">
                  {board.fen}
                </p>

                <div className="mt-auto">
                  <a
                    href={`https://lichess.org/editor/${board.fen.replace(/ /g, "_")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-sky-500/10 text-sky-400 font-bold py-2 rounded border border-sky-500/50 hover:bg-sky-500/20 transition-colors"
                  >
                    Analyze on Lichess
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
