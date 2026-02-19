import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/library"
          element={
            <AuthGuard>
              <div className="text-white">
                Your Saved Games Library Coming Soon...
              </div>
            </AuthGuard>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
