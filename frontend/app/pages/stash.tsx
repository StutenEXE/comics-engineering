import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import { SidebarInset, SidebarProvider } from "~/components/shadcn/ui/sidebar";
import { CollectionSidebar } from "~/components/sidebars/StashSidebar";
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
        <SidebarProvider className="min-h-[calc(100svh-var(--header-height))]">
          <CollectionSidebar />
          {/* min-w-0 lets wide content (tables, charts) scroll instead of stretching the page */}
          <SidebarInset className="min-w-0">
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </LoggedProtectedRoute>
    </>
  );
}
