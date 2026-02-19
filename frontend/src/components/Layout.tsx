import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8">
        <Outlet />
      </main>
    </div>
  );
}
