import type { Error } from "~/utils/error";
import type { Serie } from "~/models/serie";
import { GenericList } from "../GenericList";
import { BookList } from "../booklists/BookList";
import { useState } from "react";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";
import { useTranslation } from "~/i18n/i18n";
import { Link } from "react-router";

interface CollapsableSerieListProps {
  serieList: Serie[] | null | undefined;
  descOrder?: boolean;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function CollapsableSerieList({
  serieList,
  descOrder,
  isLoading,
  error,
  className,
}: CollapsableSerieListProps) {
  const { t } = useTranslation();

  const mapper = (ser: Serie) => {
    const isIncomplete = ser?.books.length < ser?.nvolumes;
    const [isOpened, setOpened] = useState(isIncomplete);

    return (
      <div
        key={ser.id}
        className="w-full rounded-lg border border-white/8 overflow-hidden"
      >
        {/* Header row */}
        <div
          onClick={() => setOpened((o) => !o)}
          className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/serie/${ser.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-white/80 hover:underline hover:text-indigo-300 transition-colors truncate"
            >
              {ser?.name}
            </Link>

            {/* Completion badge */}
            <span
              className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                isIncomplete
                  ? "text-amber-400/70 border-amber-400/20 bg-amber-400/5"
                  : "text-emerald-400/70 border-emerald-400/20 bg-emerald-400/5"
              }`}
            >
              {ser?.books.length}/{ser?.nvolumes}
            </span>
          </div>

          <div className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">
            {isOpened ? (
              <BsArrowsCollapse size={15} />
            ) : (
              <BsArrowsExpand size={15} />
            )}
          </div>
        </div>

        {/* Book list */}
        {isOpened && (
          <div className="border-t border-white/8 p-2">
            <BookList bookList={ser?.books} />
          </div>
        )}
      </div>
    );
  };

  const list = !serieList
    ? []
    : [...serieList].sort((s1, s2) =>
        descOrder
          ? s2.name.localeCompare(s1.name)
          : s1.name.localeCompare(s2.name),
      );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-12 rounded-lg bg-white/5 border border-white/8 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-rose-400/70 font-mono py-4">
        {error.details.error}
      </p>
    );
  }

  return (
    <GenericList
      list={list}
      emptyMsg={t("serie.nonefound")}
      elemGenerator={mapper}
      vertical
      className={`max-h-full w-full ${className}`}
    />
  );
}
