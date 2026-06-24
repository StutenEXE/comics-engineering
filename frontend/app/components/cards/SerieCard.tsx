import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleSerie } from "~/models/serie";

type SerieCardProps = {
  serie?: SimpleSerie;
  className?: string;
};

export function SerieCard({ serie, className }: SerieCardProps) {
  const { t } = useTranslation();

  if (!serie) return null;

  const serieLabel = serie.oneshot
    ? t("serie.oneshot")
    : `${serie.nvolumes} ${t("generic.volumes")}`;

  return (
    <Link
      to={`/serie/${serie.id}`}
      className={twMerge("group block w-300", className)}
    >
      <div className="flex items-center justify-between gap-4 px-1 py-2 rounded-md border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all">
        <p className="w-full text-sm text-white/70 group-hover:text-white/90 transition-colors truncate whitespace-nowrap">
          {serie.name}{" "}
          <span className="text-white/30 shrink-0">({serieLabel})</span>
        </p>
      </div>
    </Link>
  );
}
