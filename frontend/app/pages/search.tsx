import { MdSearch } from "react-icons/md";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useLazySearchBooksSeriesIssuesIssueseriesByNameQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { BookSerieIssueIssueserieList } from "~/components/lists/BookSerieIssueIssueserieList";
import { useSearchParams } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Search` },
    { name: "description", content: `Search comics & series` },
  ];
}

export default function SearchPage({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q");

  const [search, { data, isFetching, error }] =
    useLazySearchBooksSeriesIssuesIssueseriesByNameQuery();

  const [isLT3, setIsLT3] = useState(false);

  const triggerSearch = (query: string) => {
    query = query.trim();
    setSearchParams({ q: query });
    // We want the query to be longer before executing it
    if (query.length < 3) {
      setIsLT3(true);
      return;
    }
    setIsLT3(false);
    search({ query });
  };

  // On load
  useEffect(() => {
    if (q) {
      search({ query: q });
    }
  }, []);

  const noData =
    (data?.books.length ?? 0) +
      (data?.series.length ?? 0) +
      (data?.issues.length ?? 0) +
      (data?.issueseries.length ?? 0) ===
    0;

  const sortedData = {
    books: data?.books
      ? [...data?.books].sort((a, b) => a.name.length - b.name.length)
      : [],
    series: data?.series
      ? [...data?.series].sort((a, b) => a.name.length - b.name.length)
      : [],
    issues: data?.issues
      ? [...data?.issues].sort((a, b) => a.name.length - b.name.length)
      : [],
    issueseries: data?.issueseries
      ? [...data?.issueseries].sort((a, b) => a.name.length - b.name.length)
      : [],
  };

  return (
    <GenericPageTemplate>
      <div className="flex flex-col items-center gap-6 relative">
        {/* Search bar */}
        <div className="w-full max-w-xl flex flex-col gap-2 p-2 bg-black/80 backdrop-blur-md border border-neutral-800 rounded sticky top-25 z-20 ">
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
              onChange={(e) => triggerSearch(e.target.value)}
              defaultValue={q || ""}
              className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 pr-10 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full"
            />
            {/* Search icon */}
            <MdSearch
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
              size={18}
            />
          </div>

          {/* Hint */}
          {isLT3 && (
            <p className="text-xs text-white/25 italic">
              {t("search.gte3chars")}
            </p>
          )}
        </div>

        {/* Valid query */}
        {!isLT3 && data && (
          <div className="w-full max-w-xl flex flex-col gap-3">
            {/* Results */}
            {!noData && (
              <BookSerieIssueIssueserieList
                data={sortedData}
                isLoading={isFetching}
              />
            )}

            {/* No results */}
            {!isFetching && noData && (
              <div className="flex flex-col items-center gap-2 py-12 border border-white/8 rounded-lg">
                <MdSearch size={32} className="text-white/10" />
                <p className="text-sm text-white/25 italic">
                  {t("search.noresults")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </GenericPageTemplate>
  );
}
