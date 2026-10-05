import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "donor" | "admin";
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Not logged in: go to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in with the wrong role: admins go to their area, everyone else goes home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/"} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;