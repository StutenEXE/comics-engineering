import { type User } from "~/models/user";
import { BooleanCellRenderer, GenericTable } from "./GenericTable";
import { createError, type Error } from "~/utils/error";
import {
  MdDelete,
  MdModeEdit,
  MdRecycling,
  MdRemoveRedEye,
} from "react-icons/md";
import { Link } from "react-router";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";
import { useToast } from "../toast/Toast";
import { createColumnHelper } from "@tanstack/react-table";
import {
  useDeleteUserMutation,
  useRecycleUserMutation,
  useUserListQuery,
} from "~/store/services/api";

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
  const [recycleUser] = useRecycleUserMutation();

  const asyncMutationTrigger = (
    callback: () => Promise<any>,
    title: string,
    message: string,
    successMsg: string,
  ) => {
    confirm({
      title: title,
      message: message,
      onConfirm: () => {
        callback()
          .then(() => {
            refetch();
            toast.success(successMsg);
          })
          .catch(() => {
            toast.success(t("toast.error"));
          });
      },
    });
  };

  // Define table columns
  const col = createColumnHelper<User>();
  const columns = [
    col.accessor("id", {
      header: t("user.id"),
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
      enableColumnFilter: false,
    }),
    col.accessor("isAdmin", {
      id: "isAdmin",
      header: t("user.isAdmin"),
      cell: (info) => <BooleanCellRenderer val={info.getValue()} />,
      meta: { filterType: "boolean" },
    }),
    col.accessor("isDeleted", {
      id: "isDeleted",
      header: t("user.isDeleted"),
      cell: (info) => <BooleanCellRenderer val={info.getValue()} />,
      meta: { filterType: "boolean" },
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
            {row.original.isDeleted && (
              <MdRecycling
                size={20}
                className="cursor-pointer hover:text-amber-500"
                onClick={() =>
                  asyncMutationTrigger(
                    async () => await recycleUser({ id: row.original.id }),
                    t("user.action.recycle"),
                    t("user.action.recycle.message", {
                      parameters: { username: row.original.username },
                    }),
                    t("toast.recycle.user.success"),
                  )
                }
              />
            )}
            {!row.original.isDeleted && (
              <MdDelete
                size={20}
                className="cursor-pointer hover:text-red-500"
                onClick={() =>
                  asyncMutationTrigger(
                    async () => await deleteUser({ id: row.original.id }),
                    t("user.action.delete"),
                    t("user.action.delete.message", {
                      parameters: { username: row.original.username },
                    }),
                    t("toast.delete.user.success"),
                  )
                }
              />
            )}
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
