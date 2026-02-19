import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <div className="flex h-screen items-center justify-center bg-gray-900 text-3xl font-bold text-sky-400">
            Chess Dashboard Coming Soon...
          </div>
        }
      />
    </Routes>
  );
}

export default App;
