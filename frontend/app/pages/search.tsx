import { useState } from "react";
import { CollapsableSerieList } from "~/components/lists/serielists/CollapsableSerieList";
import { useTranslation } from "~/i18n/i18n";
import type { Book } from "~/models/book";
import { simpleSerieToSerie, type Serie } from "~/models/serie";
import { useSearchBooksAndSeriesByNameQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import { deepCopy } from "~/utils/object";
import type { Route } from "../+types/root";
import { MdSearch } from "react-icons/md";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Search` },
    { name: "description", content: `Search comics & series` },
  ];
}

export default function SearchPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const { data, error, isLoading } = useSearchBooksAndSeriesByNameQuery({
    query,
  });
  const books = data?.books ?? [];
  const series = data?.series ?? [];
  const err = createError(error);

  const serieIds = new Set();
  let allSeries: Serie[] = [...deepCopy(series), ...deepCopy(books)]
    .flatMap((el: Serie | Book) =>
      (el as Book).serie ? (el as Book).serie : (el as Serie),
    )
    .filter((ser) => ser !== null)
    .filter(({ id }) => !serieIds.has(id) && serieIds.add(id))
    .map((ser) => simpleSerieToSerie(ser));

  books.forEach((bk) => {
    if (!bk?.serie?.id) return;
    let ser = allSeries.find((ser) => ser.id === bk?.serie?.id);
    if (ser?.books.find((bk2) => bk.id === bk2.id)) return;
    ser?.books.push(deepCopy(bk));
  });

  allSeries.forEach((ser) => {
    ser?.books.forEach((bk) => {
      bk.serieId = ser.id;
    });
  });

  const trimmed = query.trim();
  const isShort = trimmed.length < 3;
  const hasResults = allSeries.length > 0;

  return (
    <GenericPageTemplate>
      <div className="flex flex-col items-center gap-6">
        {/* Search bar */}
        <div className="w-full max-w-xl flex flex-col gap-2">
          <label
            htmlFor="search"
            className="text-xs font-medium uppercase tracking-widest text-white/40"
          >
            {t("search.header")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              name="search"
              autoComplete="off"
              placeholder={t("search.placeholder")}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 pr-10 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full"
            />
            {/* Search icon */}
            <MdSearch
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
              size={18}
            />
          </div>

          {/* Hint */}
          {isShort && trimmed.length > 0 && (
            <p className="text-xs text-white/25 italic">
              {t("search.gte3chars")}
            </p>
          )}
        </div>

        {/* Valid query */}
        {!isShort && (
          <div className="w-full max-w-xl flex flex-col gap-3">
            {/* Results header */}
            {!isLoading && !err && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                  {t("search.results")}
                </span>
                {hasResults && (
                  <span className="text-xs text-white/25">
                    {allSeries.length} {t("search.series")}
                  </span>
                )}
              </div>
            )}

            {/* Results */}
            {!isLoading && !err && hasResults && (
              <CollapsableSerieList
                serieList={allSeries}
                isLoading={isLoading}
                error={err}
              />
            )}

            {/* No results */}
            {!isLoading && !err && !hasResults && (
              <div className="flex flex-col items-center gap-2 py-12 border border-white/8 rounded-lg">
                <MdSearch size={32} className="text-white/10" />
                <p className="text-sm text-white/25 italic">
                  {t("search.noresults")} "
                  <span className="text-white/40">{trimmed}</span>"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </GenericPageTemplate>
  );
}
