import { useState } from "react";
import axios from "axios";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ username, password });
      localStorage.setItem("token", data.access_token);
      navigate("/library");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Invalid username or password");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-white text-center">
          ChessLens
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Username
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-sky-500 py-2 font-bold text-white transition hover:bg-sky-600"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
