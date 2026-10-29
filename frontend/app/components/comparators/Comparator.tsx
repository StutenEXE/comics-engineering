import type { ReactNode } from "react";
import {
  MdClose,
  MdCompareArrows,
  MdSwapHoriz,
  MdSwapVert,
} from "react-icons/md";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n.js";
import type { Book } from "~/models/book.js";
import type { IssueSerie } from "~/models/issue-serie.js";
import type { Issue } from "~/models/issue.js";
import type { Serie } from "~/models/serie.js";
import { BookComparator } from "./BookComparator";
import { SlotMarker, type Slot } from "./ComparatorParts";
import { IssueComparator } from "./IssueComparator";
import { IssueContentComparator } from "./IssueContentComparator";
import { IssueSerieComparator } from "./IssueSerieComparator";
import { SerieComparator } from "./SerieComparator";

// The full items given by the search : they hold (almost) everything the comparators need
export type Comparable =
  | { type: "book"; data: Book }
  | { type: "serie"; data: Serie }
  | { type: "issue"; data: Issue }
  | { type: "issueserie"; data: IssueSerie };

export type ComparableType = Comparable["type"];

export function isSameComparable(x?: Comparable, y?: Comparable): boolean {
  return !!x && !!y && x.type === y.type && x.data.id === y.data.id;
}

type Translate = ReturnType<typeof useTranslation>["t"];

/**
 * Title and context line of an item (ex : a book's serie and volume)
 */
export function describeComparable(
  item: Comparable,
  t: Translate,
): { title: string; subtitle?: string } {
  switch (item.type) {
    case "book": {
      const serie = item.data.serie;
      const volume = serie?.oneshot
        ? t("serie.oneshot")
        : `${t("generic.volume", { capitalize: true })} ${item.data.number}`;
      return {
        title: item.data.name,
        subtitle: serie ? `${serie.name} · ${volume}` : undefined,
      };
    }
    case "serie":
      return {
        title: item.data.name,
        subtitle: `${item.data.nvolumes ?? "?"} ${t("generic.volumes")}`,
      };
    case "issue":
      return {
        title: `${item.data.issueSerie?.name ?? ""} #${item.data.number}`,
        subtitle: item.data.name,
      };
    case "issueserie": {
      const start = item.data.startDate?.slice(0, 4);
      const end = item.data.endDate?.slice(0, 4) ?? t("generic.present");
      return {
        title: item.data.name,
        subtitle: start ? `${start} – ${end}` : undefined,
      };
    }
  }
}

interface ComparatorProps {
  itemA?: Comparable;
  itemB?: Comparable;
  onRemove: (slot: Slot) => void;
  onSwap: () => void;
}

export function Comparator({ itemA, itemB, onRemove, onSwap }: ComparatorProps) {
  const { t } = useTranslation();

  let body: ReactNode;
  if (!itemA || !itemB) {
    body = <Notice icon={<MdCompareArrows size={22} />}>{t("compare.pickBoth")}</Notice>;
  } else if (itemA.type !== itemB.type) {
    // Different types only share their issue content
    body = (
      <>
        <p className="text-xs italic text-white/35">
          {t("compare.typeMismatch", {
            parameters: {
              a: t(`compare.type.${itemA.type}`),
              b: t(`compare.type.${itemB.type}`),
            },
          })}
        </p>
        <IssueContentComparator
          key={`${itemA.type}-${itemA.data.id}-${itemB.type}-${itemB.data.id}`}
          a={itemA}
          b={itemB}
        />
      </>
    );
  } else {
    body = (
      <>
        {isSameComparable(itemA, itemB) && (
          <p className="text-xs italic text-white/35">{t("compare.sameItem")}</p>
        )}
        {/* Keyed so that the filters reset when an item changes */}
        <TypedComparator
          key={`${itemA.type}-${itemA.data.id}-${itemB.data.id}`}
          a={itemA}
          b={itemB}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <SlotCard slot="A" item={itemA} onRemove={() => onRemove("A")} />
        <button
          type="button"
          onClick={onSwap}
          disabled={!itemA && !itemB}
          aria-label={t("compare.swap")}
          title={t("compare.swap")}
          className="mx-auto flex cursor-pointer items-center justify-center rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/5 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <MdSwapVert size={20} className="sm:hidden" />
          <MdSwapHoriz size={20} className="hidden sm:block" />
        </button>
        <SlotCard slot="B" item={itemB} onRemove={() => onRemove("B")} />
      </div>
      {body}
    </div>
  );
}

/**
 * Comparator of the type of the items, A and B must be of the same type
 */
function TypedComparator({ a, b }: { a: Comparable; b: Comparable }) {
  switch (a.type) {
    case "book":
      return <BookComparator a={a.data} b={b.data as Book} />;
    case "serie":
      return <SerieComparator a={a.data} b={b.data as Serie} />;
    case "issue":
      return <IssueComparator a={a.data} b={b.data as Issue} />;
    case "issueserie":
      return <IssueSerieComparator a={a.data} b={b.data as IssueSerie} />;
  }
}

function SlotCard({
  slot,
  item,
  onRemove,
}: {
  slot: Slot;
  item?: Comparable;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  if (!item) {
    return (
      <div className="flex min-h-20 items-center gap-3 rounded-lg border border-dashed border-white/10 px-3 py-3 text-sm text-white/30">
        <SlotMarker slot={slot} present={false} />
        {t("compare.pickItem")}
      </div>
    );
  }

  const { title, subtitle } = describeComparable(item, t);
  return (
    <div className="flex min-h-20 min-w-0 items-start gap-3 rounded-lg border border-white/8 bg-white/3 p-3">
      <SlotMarker slot={slot} className="mt-0.5" />
      {item.type === "book" && (
        <img
          src={item.data.imgUrl || "/placeholder.jpg"}
          alt=""
          className="w-10 aspect-[2/3] shrink-0 rounded-sm border border-white/8 object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wider text-white/35">
          {t(`compare.type.${item.type}`)}
        </span>
        <Link
          to={`/${item.type}/${item.data.id}`}
          className="line-clamp-2 text-sm font-medium text-white/85 transition-colors hover:text-indigo-300"
        >
          {title}
        </Link>
        {subtitle && <p className="truncate text-xs text-white/40">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("compare.remove")}
        title={t("compare.remove")}
        className="cursor-pointer rounded-md p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-red-400"
      >
        <MdClose size={16} />
      </button>
    </div>
  );
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-white/8 px-4 py-10 text-center">
      <span className="text-white/15">{icon}</span>
      <p className="max-w-md text-sm text-white/40">{children}</p>
    </div>
  );
}
