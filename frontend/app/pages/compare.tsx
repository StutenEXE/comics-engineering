import { useEffect, useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import {
  Comparator,
  describeComparable,
  isSameComparable,
  type Comparable,
} from "~/components/comparators/Comparator.js";
import type { Slot } from "~/components/comparators/ComparatorParts.js";
import { SearchInput } from "~/components/inputs/SearchInput";
import { SkeletonText } from "~/components/misc/Skeleton";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useTranslation } from "~/i18n/i18n.js";
import { useSearchAllByNameQuery } from "~/store/services/api.js";
import type { Route } from "./+types/compare";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Comparator` },
    { name: "description", content: `Compare items` },
  ];
}

const SEARCH_TYPES = ["books", "series", "issues", "issueseries"];
// Shorter queries return nothing (see the search API)
const MIN_QUERY_LENGTH = 3;
const RESULTS_PER_TYPE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function ComparePage() {
  const { t } = useTranslation();

  // The search is only sent once the user stopped typing
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [query]);

  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const { data, isFetching } = useSearchAllByNameQuery(
    { query: debouncedQuery, types: SEARCH_TYPES, limit: RESULTS_PER_TYPE },
    { skip: !canSearch },
  );

  const results = useMemo<Comparable[]>(
    () =>
      data
        ? [
            ...data.books.map((bk): Comparable => ({ type: "book", data: bk })),
            ...data.series.map((se): Comparable => ({ type: "serie", data: se })),
            ...data.issues.map((is): Comparable => ({ type: "issue", data: is })),
            ...data.issueseries.map(
              (iss): Comparable => ({ type: "issueserie", data: iss }),
            ),
          ].sort((a, b) => a.data.name.length - b.data.name.length)
        : [],
    [data],
  );

  const [items, setItems] = useState<Partial<Record<Slot, Comparable>>>({});

  // Picking the item already in the slot empties it
  const toggleItem = (slot: Slot, item: Comparable) =>
    setItems((prev) => ({
      ...prev,
      [slot]: isSameComparable(prev[slot], item) ? undefined : item,
    }));

  return (
    <GenericPageTemplate>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white/90">
          {t("header.compare")}
        </h1>
        <p className="text-sm text-white/40">{t("compare.subtitle")}</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-white/8">
        <SearchInput triggerSearch={setQuery} />
        {canSearch && (
          <div className="max-h-80 overflow-y-auto border-t border-white/8">
            {isFetching && results.length === 0 && (
              <div className="p-3">
                <SkeletonText lines={3} />
              </div>
            )}
            {!isFetching && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8">
                <MdSearch size={28} className="text-white/10" />
                <p className="text-sm italic text-white/25">
                  {t("search.noresults")}
                </p>
              </div>
            )}
            <ul className={twMerge(isFetching && "opacity-60")}>
              {results.map((item) => (
                <ResultRow
                  key={`${item.type}-${item.data.id}`}
                  item={item}
                  items={items}
                  onToggle={toggleItem}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      <Comparator
        itemA={items.A}
        itemB={items.B}
        onRemove={(slot) => setItems((prev) => ({ ...prev, [slot]: undefined }))}
        onSwap={() => setItems((prev) => ({ A: prev.B, B: prev.A }))}
      />
    </GenericPageTemplate>
  );
}

function ResultRow({
  item,
  items,
  onToggle,
}: {
  item: Comparable;
  items: Partial<Record<Slot, Comparable>>;
  onToggle: (slot: Slot, item: Comparable) => void;
}) {
  const { t } = useTranslation();
  const { title, subtitle } = describeComparable(item, t);
  const typeLabel = t(`compare.type.${item.type}`);

  return (
    <li className="flex items-center gap-3 border-b border-white/5 px-3 py-2 last:border-b-0 hover:bg-white/3">
      <span className="hidden w-28 shrink-0 text-[11px] uppercase tracking-wider text-white/30 sm:block">
        {typeLabel}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white/80">{title}</p>
        <p className="truncate text-xs text-white/35">
          <span className="sm:hidden">{typeLabel} · </span>
          {subtitle}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {(["A", "B"] as Slot[]).map((slot) => {
          const isSet = isSameComparable(items[slot], item);
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={isSet}
              onClick={() => onToggle(slot, item)}
              aria-label={t("compare.setAs", { parameters: { slot } })}
              title={t("compare.setAs", { parameters: { slot } })}
              className={twMerge(
                "min-w-8 cursor-pointer rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                isSet
                  ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
                  : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white/85",
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </li>
  );
}
