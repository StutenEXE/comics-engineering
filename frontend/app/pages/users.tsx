import { AdminProtectedRoute } from "~/components/security/AdminProtectedRoute";
import { UserTable } from "~/components/tables/UserTable";
import { useUserListQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users" },
    { name: "description", content: "User management" },
  ];
}

export default function UsersPage() {
  return (
    <AdminProtectedRoute>
      <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
        <div className="w-full max-w-6xl space-y-8">
          <UserTable
            showActions
          />
        </div>
      </main>
    </AdminProtectedRoute>
  );
}
