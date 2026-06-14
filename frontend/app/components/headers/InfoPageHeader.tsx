import { MdModeEdit } from "react-icons/md";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";

interface PageHeaderComponentProps {
  headerTitle: string;
  headerTitleTo?: string; // e.g. "/books"
  title: string;
  subtitle?: string;
  subtitleTo?: string; // e.g. "/serie/42"
  createdAt?: Date;
  modifiedAt?: Date;
  addedBy?: string;
  onEditClick?: () => void;
  isLoading?: boolean;
}

export function InfoPageHeaderComponent({
  headerTitle,
  headerTitleTo,
  title,
  subtitle,
  subtitleTo,
  createdAt,
  modifiedAt,
  addedBy,
  onEditClick,
  isLoading,
}: PageHeaderComponentProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-white/10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest">
        <span className="text-white/30">{headerTitle}</span>
        <span className="text-white/15">›</span>
        {/* Name loading */}
        {isLoading && (
          <span className="w-50 bg-white/5 rounded border border-white/8 animate-pulse">
            &nbsp;
          </span>
        )}
        {/* Name loaded */}
        {!isLoading && (
          <>
            {headerTitleTo ? (
              <Link
                to={headerTitleTo}
                className="text-white/50 hover:underline hover:text-indigo-300 transition-colors"
              >
                {title} <span className="font-normal">↗</span>
              </Link>
            ) : (
              <span className="text-white/50">{title}</span>
            )}
          </>
        )}
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-1">
        {/* Loading & loaded are handled with tailwind classes */}
        <h1
          className={twMerge(
            "text-2xl font-semibold text-white/90",
            isLoading &&
              "bg-white/5 rounded border border-white/8 animate-pulse",
          )}
        >
          {title}&nbsp;
        </h1>
        {/* Loading */}
        {isLoading && (
          <span className="text-sm w-full bg-white/5 rounded border border-white/8 animate-pulse">
            &nbsp;
          </span>
        )}
        {!isLoading && (
          <>
            {subtitle &&
              (subtitleTo ? (
                <Link
                  to={subtitleTo}
                  className="text-sm text-white/40 italic hover:underline hover:text-indigo-300 transition-colors w-fit"
                >
                  {subtitle} <span className="not-italic">↗</span>
                </Link>
              ) : (
                <p className="text-sm text-white/40 italic">{subtitle}</p>
              ))}{" "}
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-white/25">
          {t("infoheader.addedBy")}&nbsp;
          {/* Loading & loaded */}
          <span
            className={twMerge(
              "text-white/50",
              isLoading &&
                "inline-block w-20 bg-white/5 rounded border border-white/8 animate-pulse",
            )}
          >
            {addedBy}&nbsp;
          </span>
          {t("generic.the")}&nbsp;
          {/* Loading & loaded */}
          <span
            className={twMerge(
              "text-white/50",
              isLoading &&
                "inline-block w-17 bg-white/5 rounded border border-white/8 animate-pulse",
            )}
          >
            {createdAt?.toLocaleDateString(locale)}&nbsp;
          </span>
        </p>
        <span className="text-white/10">·</span>
        <p className="text-xs text-white/25">
          {t("infoheader.modified")}&nbsp;
          {/* Loading & loaded */}
          <span
            className={twMerge(
              "text-white/50",
              isLoading &&
                "inline-block w-17 bg-white/5 rounded border border-white/8 animate-pulse",
            )}
          >
            {modifiedAt?.toLocaleDateString(locale)}&nbsp;
          </span>
        </p>
      </div>

      {/* If there is an expected behavior for edition, show edition button */}
      {!isLoading && onEditClick && (
        <div
          onClick={onEditClick} 
          className="group flex gap-1 text-xs text-white/25 cursor-pointer hover:underline hover:text-white/75"
        >
          <p>
            {t("generic.edit")}
          </p>
          <MdModeEdit size={16} />
        </div>
      )}
    </div>
  );
}
