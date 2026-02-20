import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ChessboardDropzoneProps {
  // The parent page will pass this function to handle the actual API call
  onAnalyze: (file: File) => void;
  isAnalyzing?: boolean;
}

export default function ChessboardDropzone({
  onAnalyze,
  isAnalyzing = false,
}: ChessboardDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary local URL so the user can see what they uploaded
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the file dialog again
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        // STATE 1: Empty Dropzone
        <div
          {...getRootProps()}
          className={`group relative h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-sky-500 bg-sky-500/10"
              : "border-gray-700 bg-gray-800/30 hover:border-sky-500 hover:bg-gray-800/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-4 rounded-full bg-gray-700/50 p-4 group-hover:bg-sky-500/10 transition-colors">
            <svg
              className="w-10 h-10 text-gray-500 group-hover:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p className="text-gray-400 font-medium group-hover:text-gray-200">
            {isDragActive
              ? "Drop the board here..."
              : "Drag and drop chessboard image here"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supports PNG, JPG (Max 5MB)
          </p>
        </div>
      ) : (
        // STATE 2: Image Preview & Actions
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-full max-w-md rounded-xl overflow-hidden border border-gray-700 shadow-lg">
            <img
              src={previewUrl!}
              alt="Chessboard preview"
              className="w-full h-auto object-cover"
            />
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="absolute top-2 right-2 bg-gray-900/80 text-gray-300 hover:text-white p-2 rounded-full backdrop-blur-sm transition disabled:opacity-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => onAnalyze(selectedFile)}
            disabled={isAnalyzing}
            className="w-full max-w-md bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">Analyzing Board...</span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
