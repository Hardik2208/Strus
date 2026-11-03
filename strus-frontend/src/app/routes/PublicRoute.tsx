import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Or a subtle loading spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/sessions" replace />;
  }

  return <Outlet />;
};
