import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "~/store/store";
import { useToast } from "../toast/Toast";
import { useEffect } from "react";
import { useTranslation } from "~/i18n/i18n";

interface LoggedProtectedRouteProps {
    children: ReactNode
}

export function LoggedProtectedRoute({ children }: LoggedProtectedRouteProps) {
  const { t } = useTranslation();


  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const toast = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t("toast.loggedroute.access_denied"));
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace/>;
  }

  return children;
}