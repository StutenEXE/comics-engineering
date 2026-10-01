import { MdSearch } from "react-icons/md";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useLazySearchAllByNameQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import {
  AllItemsList,
  type AllItemsType,
} from "~/components/lists/AllItemsList";
import { useSearchParams } from "react-router";
import { SearchInput } from "~/components/inputs/SearchInput";
import { SearchAllInput } from "app/components/inputs/SearchAllInput";

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
  const types = searchParams.get("types")?.split(",") ?? [
    "books",
    "series",
    "issues",
    "issueseries",
  ];

  const [isLT3, setIsLT3] = useState(false);

  const [search, { data, isFetching, error }] = useLazySearchAllByNameQuery();

  const onFilterChange = (filters: string[]) => {
    console.log("onFilterChange", filters);
    setSearchParams({ q: q ?? "", types: filters.join(",") });
  };

  const triggerSearch = (query: string) => {
    query = query.trim();
    setSearchParams({ q: query, types: types.join(",") });
    // We want the query to be longer before executing it
    setIsLT3(query.length < 3);
    if (isLT3) {
      return;
    }
    // TODO add types
    search({ query, types });
  };

  // On load
  useEffect(() => {
    if (q) {
      search({ query: q, types });
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
          <SearchAllInput
            defaultValue={q ?? ""}
            defaultFilters={types}
            onFilterChange={onFilterChange}
            triggerSearch={triggerSearch}
          />
        </div>

        {/* Valid query */}
        {!isLT3 && data && (
          <div className="w-full flex flex-col gap-3">
            {/* Results */}
            {!noData && (
              <AllItemsList
                data={sortedData}
                types={types as AllItemsType[]}
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
