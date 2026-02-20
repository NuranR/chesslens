import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import Library from "./pages/Library";
import BoardDetails from "./pages/BoardDetails";

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
              <Library />
            </AuthGuard>
          }
        />
      </Route>
      <Route
        path="/board/:id"
        element={
          <AuthGuard>
            <BoardDetails />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default App;
