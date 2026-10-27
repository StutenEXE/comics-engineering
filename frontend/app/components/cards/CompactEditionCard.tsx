import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleEdition } from "~/models/edition";
import { toDDmmYYYY } from "~/utils/date";

type CompactEditionCardProps = {
  edition: SimpleEdition | undefined | null;
  onClick: () => void;
  className?: string;
};

/**
 * One line edition card (small cover + publisher), for narrow spaces such as side panels
 */
export function CompactEditionCard({
  edition,
  onClick,
  className,
}: CompactEditionCardProps) {
  const { t, locale } = useTranslation();

  if (!edition) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "group flex items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-white/5 transition-colors cursor-pointer",
        className,
      )}
    >
      <img
        src={edition.imgUrl || "/placeholder.jpg"}
        alt={edition.publisherName ?? ""}
        className="w-8 aspect-[2/3] shrink-0 rounded-sm border border-white/8 object-cover"
      />
      <div className="flex flex-col min-w-0">
        <h3 className="text-xs font-medium text-white/80 truncate group-hover:text-indigo-300 transition-colors">
          {edition.publisherName ?? t("generic.unknown")}
        </h3>
        <p className="text-[11px] text-indigo-300/60">
          {edition.parutionDate && toDDmmYYYY(edition.parutionDate, locale)}
        </p>
        {edition.coverType && (
          <p className="text-[11px] text-white/40 truncate">
            {t(`edition.coverType.${edition.coverType}`)}
          </p>
        )}
      </div>
    </button>
  );
}
