import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/chesslens-logo.jpg"; // Make sure this path matches where you saved the image!

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    // Added p-8 for spacing, and max-w-7xl mx-auto to align with the rest of the page
    <nav className="flex justify-between items-center mb-12 p-8 max-w-7xl mx-auto w-full">
      {/* Logo as Home Button */}
      <Link
        to="/"
        className="flex flex-row items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <img
          src={logo}
          alt="ChessLens Logo"
          // Swapped the shadow color to match the cyan neon glow
          className="h-12 w-12 object-cover rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        />
        {/* Added a custom gradient that matches the light-blue to dark-blue metallic look of the knight */}
        <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
          ChessLens
        </span>
      </Link>

      <div className="space-x-4 flex items-center">
        {isLoggedIn ? (
          <>
            {/* Fixed the link to point to /library instead of / */}
            <Link
              to="/library"
              className="text-gray-300 hover:text-sky-400 transition-colors"
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
              className="text-gray-300 hover:text-sky-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-sky-500 text-white px-4 py-2 rounded font-bold hover:bg-sky-600 transition-all"
            >
              Join to Save Games
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
