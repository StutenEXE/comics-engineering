import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "~/store/store";
import { useToast } from "../toast/Toast";
import { useEffect } from "react";
import { useTranslation } from "~/i18n/i18n";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { t } = useTranslation();

  const { user, isAuthenticated, isHydrated } = useSelector(
    (state: RootState) => state.user,
  );
  const toast = useToast();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      toast.error(t("toast.adminroute.access_denied"));
    }
  }, [isAuthenticated, user?.isAdmin, toast]);

  if (!isHydrated) {
    return <span>Loading...</span>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
