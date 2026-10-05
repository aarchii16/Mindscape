import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "@/lib/auth";

// Simple auth guard: if no token, redirect to /auth
export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default ProtectedRoute;