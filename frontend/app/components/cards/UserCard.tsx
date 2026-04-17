import { Link } from "react-router";
import type { User } from "~/models/user";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { capitalize } from "~/utils/strings";

type UserCardProps = {
    user: User | null | undefined;
    showActions?: boolean
    className?: string;
};


export function UserCard({ user, showActions, className }: UserCardProps) {
    const { t } = useTranslation();
    if (!user) {
        return
    }
    return (
        <Link to={`/user/${user.id}`}>
            <div className={`p-1 w-full flex justify-between ${className}`}>
                <div className="flex gap-2 items-start">
                    <p>{user?.id} - {user?.email} ({user?.username})</p>
                    <p className="text-gray-500">{ user?.isAdmin && t("generic.admin", { capitalize: true })}</p>
                </div>
                { showActions && 
                    <div className="flex gap-2 justify-end items-center">
                        <MdModeEdit size={20} />
                        <MdDelete size={20} className="text-red-500"/>
                    </div>
                }
            </div>
        </Link>
    )
}