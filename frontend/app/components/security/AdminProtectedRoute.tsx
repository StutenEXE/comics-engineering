import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "~/store/store";

interface AdminProtectedRouteProps {
    children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
    
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" replace/>;
  }

  return children;
}