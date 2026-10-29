import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n.js";
import type { SimpleBook } from "~/models/book.js";
import type { SimpleIssue } from "~/models/issue.js";
import {
  countDiff,
  overlapRatio,
  type DiffEntry,
  type DiffSide,
} from "~/utils/compare.js";
import { toDDmmYYYY } from "~/utils/date.js";
import { SkeletonText } from "../misc/Skeleton";

export type Slot = "A" | "B";

/**
 * Titled block of a comparator
 */
export function ComparatorSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-widest text-white/40">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Small A / B letter, filled when the item is on that side
 */
export function SlotMarker({
  slot,
  present = true,
  className,
}: {
  slot: Slot;
  present?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={twMerge(
        "inline-grid size-5 shrink-0 place-items-center rounded border text-[10px] font-semibold",
        present
          ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
          : "border-dashed border-white/10 text-white/15",
        className,
      )}
    >
      {slot}
    </span>
  );
}

/****************
 * FIELDS
 ****************/

export interface ComparedField {
  label: string;
  a: string | number | null | undefined;
  b: string | number | null | undefined;
}

/**
 * Label / value A / value B table, the differing values are highlighted.
 * Small screens : the label is above its two values.
 */
export function FieldsComparison({ fields }: { fields: ComparedField[] }) {
  const { t } = useTranslation();
  const display = (value: ComparedField["a"]) =>
    value === null || value === undefined || value === ""
      ? t("generic.n/a")
      : value;

  return (
    <div className="overflow-hidden rounded-lg border border-white/8">
      {fields.map((field) => {
        const differs = display(field.a) !== display(field.b);
        const valueClassName = twMerge(
          "flex min-w-0 items-start gap-2 px-3 py-2 text-sm break-words",
          differs ? "text-white/85" : "text-white/45",
        );
        return (
          <div
            key={field.label}
            className="grid grid-cols-2 border-b border-white/5 last:border-b-0 sm:grid-cols-[minmax(8rem,14rem)_1fr_1fr]"
          >
            <div className="col-span-2 flex items-center gap-2 bg-white/3 px-3 pt-2 text-[11px] uppercase tracking-wider text-white/35 sm:col-span-1 sm:py-2">
              {field.label}
              {differs && (
                <span
                  className="size-1.5 rounded-full bg-indigo-400/70"
                  title={t("compare.differs")}
                />
              )}
            </div>
            <div className={twMerge(valueClassName, "sm:border-l sm:border-white/5")}>
              <SlotMarker slot="A" className="sm:hidden" />
              <span className="min-w-0">{display(field.a)}</span>
            </div>
            <div className={twMerge(valueClassName, "border-l border-white/5")}>
              <SlotMarker slot="B" className="sm:hidden" />
              <span className="min-w-0">{display(field.b)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/****************
 * DIFF
 ****************/

interface DiffComparisonProps<T> {
  entries: DiffEntry<T>[];
  renderItem: (item: T) => ReactNode;
  isLoading?: boolean;
  // unified : one list with A / B markers, split : A and B side by side, "git diff" like
  layout?: "unified" | "split";
}

/**
 * Merged list of the items of A and B, with the side(s) having each item.
 * The counters on top filter the list.
 */
export function DiffComparison<T>({
  entries,
  renderItem,
  isLoading,
  layout = "unified",
}: DiffComparisonProps<T>) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<DiffSide | undefined>(undefined);

  const counts = useMemo(() => countDiff(entries), [entries]);
  const visible = filter
    ? entries.filter((entry) => entry.side === filter)
    : entries;

  if (isLoading) return <SkeletonText lines={4} />;

  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-white/8 px-3 py-6 text-center text-sm italic text-white/25">
        {t("compare.nothingToCompare")}
      </p>
    );
  }

  const tiles: { side: DiffSide; label: string }[] = [
    { side: "common", label: t("compare.filter.common") },
    { side: "onlyA", label: t("compare.filter.onlyA") },
    { side: "onlyB", label: t("compare.filter.onlyB") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => {
          const isSelected = filter === tile.side;
          return (
            <button
              key={tile.side}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setFilter(isSelected ? undefined : tile.side)}
              className={twMerge(
                "flex cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-indigo-500/30 bg-indigo-500/10"
                  : "border-white/8 bg-white/3 hover:bg-white/5",
              )}
            >
              <span className="text-lg font-semibold tabular-nums text-white/85">
                {counts[tile.side]}
              </span>
              <span
                className={twMerge(
                  "text-[11px] uppercase tracking-wider",
                  isSelected ? "text-indigo-300" : "text-white/35",
                )}
              >
                {tile.label}
              </span>
            </button>
          );
        })}
        <div className="flex flex-col items-start gap-0.5 rounded-lg border border-white/8 px-3 py-2">
          <span className="text-lg font-semibold tabular-nums text-white/85">
            {Math.round(overlapRatio(counts) * 100)}%
          </span>
          <span className="text-[11px] uppercase tracking-wider text-white/35">
            {t("compare.overlap")}
          </span>
        </div>
      </div>

      {/* The split diff takes its full height, its header sticks under the page header */}
      <div
        className={twMerge(
          "rounded-lg border border-white/8",
          layout === "unified" && "max-h-[28rem] overflow-y-auto",
        )}
      >
        {layout === "split" && (
          <div className="sticky top-(--header-height) z-10 grid grid-cols-2 rounded-t-lg border-b border-white/8 bg-neutral-950 text-xs text-white/40">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <SlotMarker slot="A" />
              {counts.common + counts.onlyA}
            </div>
            <div className="flex items-center gap-2 border-l border-white/8 px-2 py-1.5">
              <SlotMarker slot="B" />
              {counts.common + counts.onlyB}
            </div>
          </div>
        )}
        <ul>
          {visible.length === 0 && (
            <li className="px-3 py-4 text-center text-sm italic text-white/25">
              {t("compare.emptyFilter")}
            </li>
          )}
          {visible.map((entry) =>
            layout === "split" ? (
              <li
                key={entry.key}
                className="grid grid-cols-2 border-b border-white/5 last:border-b-0"
              >
                <SplitDiffCell
                  state={entry.side === "onlyB" ? "missing" : entry.side === "onlyA" ? "added" : "equal"}
                >
                  {renderItem(entry.item)}
                </SplitDiffCell>
                <SplitDiffCell
                  state={entry.side === "onlyA" ? "missing" : entry.side === "onlyB" ? "added" : "equal"}
                  className="border-l border-white/5"
                >
                  {renderItem(entry.item)}
                </SplitDiffCell>
              </li>
            ) : (
              <li
                key={entry.key}
                className="flex items-center gap-2 border-b border-white/5 px-2 py-1.5 last:border-b-0 hover:bg-white/3"
              >
                <SlotMarker slot="A" present={entry.side !== "onlyB"} />
                <SlotMarker slot="B" present={entry.side !== "onlyA"} />
                <div className="min-w-0 flex-1">{renderItem(entry.item)}</div>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

/**
 * One side of a split diff row : "+" when only this side has the item,
 * "=" when both have it, hatched when this side does not have it
 */
function SplitDiffCell({
  state,
  className,
  children,
}: {
  state: "equal" | "added" | "missing";
  className?: string;
  children: ReactNode;
}) {
  if (state === "missing") {
    return (
      <div
        aria-hidden
        className={twMerge("min-h-8 bg-white/2", className)}
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.06) 0 4px, transparent 4px 9px)",
        }}
      />
    );
  }

  const added = state === "added";
  return (
    <div
      className={twMerge(
        "flex min-h-8 min-w-0 items-center gap-2 px-2 py-1.5",
        // Accent bar as a shadow : the cell border is the A | B separator
        added
          ? "bg-green-400/8 shadow-[inset_2px_0_0_rgb(74_222_128/0.5)]"
          : "hover:bg-white/3",
        className,
      )}
    >
      <span
        aria-hidden
        className={twMerge(
          "w-3 shrink-0 text-center text-xs font-semibold",
          added ? "text-green-400/80" : "text-white/25",
        )}
      >
        {added ? "+" : "="}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function IssueDiffItem({ issue }: { issue: SimpleIssue }) {
  const { locale } = useTranslation();

  return (
    <Link
      to={`/issue/${issue.id}`}
      className="group flex min-w-0 items-baseline gap-2 text-sm"
    >
      {/* Shown in half width columns (split diff) : the details only on large screens */}
      <span className="min-w-0 truncate text-white/80 transition-colors group-hover:text-indigo-300">
        {issue.issueSerieName} #{issue.number}
      </span>
      <span className="hidden min-w-0 truncate text-xs text-white/35 lg:inline">
        {issue.name}
      </span>
      {issue.parutionDate && (
        <span className="ml-auto hidden shrink-0 text-xs tabular-nums text-white/30 sm:inline">
          {toDDmmYYYY(issue.parutionDate, locale)}
        </span>
      )}
    </Link>
  );
}

export function BookDiffItem({ book }: { book: SimpleBook }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/book/${book.id}`}
      className="group flex min-w-0 items-baseline gap-2 text-sm"
    >
      <span className="min-w-0 truncate text-white/80 transition-colors group-hover:text-indigo-300">
        {book.name}
      </span>
      <span className="ml-auto max-w-1/2 truncate text-xs text-white/35">
        {book.serieName} · {t("generic.volume", { capitalize: true })}{" "}
        {book.number}
      </span>
    </Link>
  );
}

// By serie, then by volume
export function compareBooksBySerie(a: SimpleBook, b: SimpleBook): number {
  return (
    (a.serieName ?? "").localeCompare(b.serieName ?? "") ||
    a.number - b.number ||
    a.id - b.id
  );
}
