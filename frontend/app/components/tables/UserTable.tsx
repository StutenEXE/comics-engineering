import { type User } from "~/models/user";
import { GenericTable } from "./GenericTable";
import { createError, type Error } from "~/utils/error";
import { MdDelete, MdModeEdit, MdRemoveRedEye } from "react-icons/md";
import { Link } from "react-router";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";
import { useToast } from "../toast/Toast";
import { createColumnHelper } from "@tanstack/react-table";
import { useDeleteUserMutation, useUserListQuery } from "~/store/services/api";

interface UserTableProps {
  showActions?: boolean;
  className?: string;
}

export function UserTable({ showActions, className }: UserTableProps) {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const toast = useToast();

  // Fetch users for current page
  const { data, error, isLoading, refetch } = useUserListQuery(
    { from: 0, limit: 10 },
    { refetchOnMountOrArgChange: true },
  );
  const users = data?.users ?? [];
  const err = createError(error);

  const [deleteUser] = useDeleteUserMutation();

  // Define table columns
  const col = createColumnHelper<User>();
  const columns = [
    col.accessor("id", {
      header: "ID",
      cell: (info) => (
        <span className="font-mono text-white/30">#{info.getValue()}</span>
      ),
    }),
    col.accessor("username", {
      header: t("user.username"),
    }),
    col.accessor("email", {
      header: t("user.email"),
    }),
    col.accessor("createdAt", {
      header: t("user.createdAt"),
      cell: (info) => info.getValue().toLocaleDateString(locale),
    }),
    col.accessor(
      (row) =>
        t(row.isAdmin ? "generic.yes" : "generic.no", {
          capitalize: true,
        }),
      {
        id: "isAdmin",
        header: t("user.isAdmin"),
      },
    ),
    col.accessor(
      (row) =>
        t(row.isDeleted ? "generic.yes" : "generic.no", {
          capitalize: true,
        }),
      {
        id: "isDeleted",
        header: t("user.isDeleted"),
      },
    ),
    col.display({
      id: "actions",
      cell: ({ row }) => {
        if (!showActions) {
          return;
        }
        return (
          <div className="w-min flex gap-2 justify-center items-center">
            <Link to={`/user/${row.original?.id}`}>
              <MdRemoveRedEye size={20} className="hover:text-green-500" />
            </Link>
            <MdModeEdit
              size={20}
              className="cursor-pointer hover:text-blue-500"
            />
            <MdDelete
              size={20}
              className="cursor-pointer hover:text-red-500"
              onClick={() =>
                confirm({
                  title: t("user.action.delete"),
                  message: `${t("user.action.delete.message", {
                    parameters: { username: row.original.username },
                  })}`,
                  onConfirm: () => {
                    deleteUser({ id: row.original.id })
                      .then(() => {
                        refetch();
                        toast.success(t("toast.delete.user.success"));
                      })
                      .catch(() => {
                        toast.success(t("toast.error"));
                      });
                  },
                })
              }
            />
          </div>
        );
      },
    }),
  ];

  return (
    <GenericTable
      list={users}
      columns={columns}
      isLoading={isLoading}
      error={err}
      className={className}
    />
  );
}
