import { Link } from "react-router";
import type { User } from "~/models/user";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";

type UserCardProps = {
  user: User | null | undefined;
  showActions?: boolean;
  className?: string;
};

export function UserCard({ user, showActions, className }: UserCardProps) {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <Link to={`/user/${user.id}`} className={`group block ${className}`}>
      <div className="flex items-center justify-between gap-4 px-3 py-2 rounded-md border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all">
        {/* Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-white/20 font-mono shrink-0">
            #{user.id}
          </span>
          <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">
            {user.username}
          </span>
          <span className="text-xs text-white/30 truncate hidden sm:block">
            {user.email}
          </span>
          {user.isAdmin && (
            <span className="text-xs text-amber-400/70 border border-amber-400/20 rounded px-1.5 py-0.5 shrink-0">
              {t("generic.admin", { capitalize: true })}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <MdModeEdit
              size={16}
              className="text-white/30 hover:text-indigo-400 cursor-pointer transition-colors"
            />
            <MdDelete
              size={16}
              className="text-white/30 hover:text-rose-400 cursor-pointer transition-colors"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
