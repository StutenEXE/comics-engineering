import { type User } from "~/models/user";
import { GenericTable } from "./GenericTable";
import type { Error } from "~/utils/error";
import { MdDelete, MdModeEdit, MdRemoveRedEye } from "react-icons/md";
import { Link } from "react-router";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";
import { useToast } from "../toast/Toast";
import { createColumnHelper } from "@tanstack/react-table";

interface UserTableProps {
  userList: User[] | null | undefined;
  isLoading?: boolean;
  error?: Error;
  showActions?: boolean;
  className?: string;
}

export function UserTable({
  userList,
  isLoading,
  error,
  showActions,
}: UserTableProps) {
  const { t, locale } = useTranslation();
  const confirm = useConfirm();
  const toast = useToast();

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
    col.accessor("isAdmin", {
      header: t("user.isAdmin"),
      cell: (info) =>
        t(info.getValue() ? "generic.yes" : "generic.no", {
          capitalize: true,
        }),
    }),
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
                  })} ${t("generic.action.cannotbeundone")}.`,
                  onConfirm: () => {
                    toast.success(
                      t("user.action.deleted", {
                        parameters: { username: row.original.username },
                      }),
                    );
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
      list={userList}
      columns={columns}
      isLoading={isLoading}
      error={error}
    />
  );
}
