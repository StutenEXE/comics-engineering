import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import { SidebarInset, SidebarProvider } from "~/components/shadcn/ui/sidebar";
import { CollectionSidebar } from "~/components/sidebars/StashSidebar";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import type { Route } from "../+types/root";
import { Outlet } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Stash` },
    { name: "description", content: `My comic stash` },
  ];
}

export default function StashPage() {
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
