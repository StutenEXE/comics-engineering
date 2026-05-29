import { getUserColumns, type User } from "~/models/user";
import { GenericTable } from "./GenericTable";
import type { Error } from "~/utils/error";
import { MdDelete, MdModeEdit, MdRemoveRedEye } from "react-icons/md";
import { Link } from "react-router";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";
import { useToast } from "../toast/Toast";

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
  const { t } = useTranslation();
  const confirm = useConfirm();
  const toast = useToast();

  const actionGenerator = (usr: User) => {
    return (
      <div className="w-min flex gap-2 justify-center items-center">
        <Link to={`/user/${usr?.id}`}>
          <MdRemoveRedEye size={20} className="hover:text-green-500" />
        </Link>
        <MdModeEdit size={20} className="cursor-pointer hover:text-blue-500" />
        <MdDelete
          size={20}
          className="cursor-pointer hover:text-red-500"
          onClick={() =>
            confirm({
              title: t("user.action.delete"),
              message: `${t("user.action.delete.message", {
                parameters: { username: usr.username },
              })} ${t("generic.action.cannotbeundone")}.`,
              onConfirm: () => {
                toast.success(
                  t("user.action.deleted", {
                    parameters: { username: usr.username },
                  }),
                );
              },
            })
          }
        />
      </div>
    );
  };

  return (
    <GenericTable
      list={userList}
      columns={getUserColumns()}
      addActions={showActions}
      actionGenerator={actionGenerator}
      isLoading={isLoading}
      error={error}
    />
  );
}
