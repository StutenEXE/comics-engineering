import { useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import { createError } from "~/utils/error";

interface OwnedSeriesTabProps {}

export function OwnedSeriesTab({}: OwnedSeriesTabProps) {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const ownedEds = data?.ownedEditions ?? [];
  const err = createError(error);

  // Group editions by series
  const serieGroups = useMemo(() => {
    if (!ownedEds) return {};
    return ownedEds.reduce(
      (acc, oe) => {
        const serieName =
          oe.edition.serie?.name || t("generic.unknown", { capitalize: true });
        if (!acc[serieName]) {
          acc[serieName] = [];
        }
        acc[serieName].push(oe);
        return acc;
      },
      {} as Record<string, typeof ownedEds>,
    );
  }, [ownedEds, t]);

  const [openSeries, setOpenSeries] = useState<Set<string>>(new Set());

  const toggle = (serieName: string) => {
    setOpenSeries((prev) => {
      const next = new Set(prev);
      next.has(serieName) ? next.delete(serieName) : next.add(serieName);
      return next;
    });
  };

  return (
    <div className={twMerge("flex flex-col gap-4", "className")}>
      {Object.entries(serieGroups).map(([serieName, editions]) => {
        const isOpen = openSeries.has(serieName);
        // Only one book per edition elements
        const owned = editions.length;

        return (
          <div key={serieName} className="rounded-lg border border-white/8 overflow-hidden">

            {/* Serie header — clickable */}
            <button
              onClick={() => toggle(serieName)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/8 transition-colors group text-left"
            >
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <h3 className="text-sm font-semibold text-white/90 group-hover:text-white truncate transition-colors">
                  {serieName}
                </h3>
                <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                  // isComplete
                  //   ? "text-emerald-400/70 border-emerald-400/20 bg-emerald-400/5"
                    /*:*/ "text-amber-400/70 border-amber-400/20 bg-amber-400/5"
                }`}>
                  {owned}/?
                </span>
              </div>

              <FaChevronDown
                size={11}
                className={`text-white/20 group-hover:text-white/50 transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Editions */}
            {isOpen && (
              <div className="flex flex-col divide-y divide-white/5 border-t border-white/8">
                {editions.map((oe) => (
                  <Link
                    key={oe.id}
                    to={`/edition/${oe.edition.id}`}
                    className="group flex items-center gap-4 px-4 py-2.5 hover:bg-white/5 transition-colors"
                  >
                    <img
                      src={oe.edition.imgUrl}
                      alt={oe.edition.book?.name}
                      className="w-8 h-12 object-cover rounded border border-white/8 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">
                        {oe.edition.book?.name}
                      </p>
                      <p className="text-xs text-white/35 truncate">
                        {oe.edition.publisher?.name}
                      </p>
                    </div>
                    <p className="text-xs text-white/20 font-mono shrink-0 hidden sm:block">
                      {oe.edition.isbn}
                    </p>
                  </Link>
                ))}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
