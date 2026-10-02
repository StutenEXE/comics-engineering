import { MdModeEdit } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { dateToVerboseDateString, toDDmmYYYY } from "~/utils/date";

interface ProfileHeaderProps {
  username?: string;
  isAdmin?: boolean;
  createdAt?: string;
  onEditClick?: () => void;
  isLoading?: boolean;
}

export function ProfileHeader({
  username,
  isAdmin,
  createdAt,
  onEditClick,
  isLoading,
}: ProfileHeaderProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest">
        <span className="text-white/30">{t("profile.header")}</span>
        <span className="text-white/15">›</span>
        {/* Name loading */}
        {isLoading && (
          <span className="w-50 bg-white/5 rounded border border-white/8 animate-pulse">
            &nbsp;
          </span>
        )}
        {/* Name loaded */}
        {!isLoading && <span className="text-white/50">{username}</span>}
      </div>

      {/* Username */}
      <div className="flex items-center gap-3">
        {/* Loading & loaded are handled with tailwind classes */}
        <h1
          className={twMerge(
            "text-2xl font-semibold text-white/90",
            isLoading &&
              "w-60 bg-white/5 rounded border border-white/8 animate-pulse",
          )}
        >
          {username}&nbsp;
        </h1>
        {!isLoading && isAdmin && (
          <span className="text-xs text-amber-400/70 border border-amber-400/20 rounded px-1.5 py-0.5 shrink-0">
            {t("generic.admin", { capitalize: true })}
          </span>
        )}
      </div>

      {/* Metadata */}
      <p className="text-xs text-white/25">
        {t("profile.memberSince")}&nbsp;
        {/* Loading & loaded */}
        <span
          className={twMerge(
            "text-white/50",
            isLoading &&
              "inline-block w-17 bg-white/5 rounded border border-white/8 animate-pulse",
          )}
        >
          {createdAt && dateToVerboseDateString(createdAt)}&nbsp;
        </span>
      </p>

      {/* Only shown when the profile can be edited (own profile) */}
      {!isLoading && onEditClick && (
        <div
          onClick={onEditClick}
          className="group flex gap-1 w-fit text-xs text-white/25 cursor-pointer hover:underline hover:text-white/75"
        >
          <p>{t("generic.edit")}</p>
          <MdModeEdit size={16} />
        </div>
      )}
    </div>
  );
}
