import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./authContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user === null) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
