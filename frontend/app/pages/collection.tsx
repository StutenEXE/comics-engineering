import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import { SidebarInset, SidebarProvider } from "~/components/shadcn/ui/sidebar";
import { CollectionSidebar } from "~/components/sidebars/CollectionSidebar";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import type { Route } from "../+types/root";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collection` },
    { name: "description", content: `Collection of comics` },
  ];
}

export default function CollectionPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  return (
    <>
      <LoggedProtectedRoute>
        <SidebarProvider>
          <CollectionSidebar variant="inset" />
          <SidebarInset>
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </LoggedProtectedRoute>
    </>
  );
}
