import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.JSX.Element;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token? Boot them to login
    return <Navigate to="/login" replace />;
  }

  // Token exists? Let them through to the protected component
  return children;
}
