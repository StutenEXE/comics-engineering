import { useUserListQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";
import { UserTable } from "~/components/tables/UserTable";
import { useSelector } from "react-redux";
import type { RootState } from "~/store/store";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { AdminProtectedRoute } from "~/components/security/AdminProtectedRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users" },
    { name: "description", content: "User management" },
  ];
}

export default function UsersPage() {    
    // Fetch users for current page
    const { data, error, isFetching } = useUserListQuery({ from: 0, limit: 10 }, { refetchOnMountOrArgChange: true },);
    const users = data?.users ?? [];
    const err = createError(error)
        
    return (
      <AdminProtectedRoute>
        <main className="flex flex-col items-center pt-8">
            <div className="max-w-500 w-1/2">
                <UserTable userList={users} isLoading={isFetching} error={err} showActions />
            </div>
        </main>
      </AdminProtectedRoute>
    )
}