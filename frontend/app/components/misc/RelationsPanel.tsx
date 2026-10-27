import type { JSX, ReactNode } from "react";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";
import type { SimpleEdition } from "~/models/edition";
import { CompactBookCard } from "../cards/CompactBookCard";
import { CompactEditionCard } from "../cards/CompactEditionCard";
import { GenericList } from "../lists/GenericList";
import { SkeletonText } from "./Skeleton";
import type { SidePanelTab } from "./SidePanelTabs";

interface RelationsTabProps {
  // Total number of related items, the tab is hidden when there is none
  count: number;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Relations tab of the info pages side panel (see SidePanelTabs) : lists the items related to the current one
 */
export function useRelationsTab({
  count,
  isLoading,
  children,
}: RelationsTabProps): SidePanelTab {
  const { t } = useTranslation();

  return {
    id: "relations",
    label: t("relations.title"),
    count: isLoading ? undefined : count,
    hidden: !isLoading && count === 0,
    content: (
      <div className="flex flex-col gap-4">
        {isLoading && <SkeletonText lines={3} />}
        {!isLoading && children}
      </div>
    ),
  };
}

interface RelationGroupProps<T> {
  label: string;
  items: T[] | null | undefined;
  elemGenerator: (item: T) => JSX.Element;
}

/**
 * Labelled list of related items, hidden when there is no item
 */
function RelationGroup<T>({ label, items, elemGenerator }: RelationGroupProps<T>) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-white/30">
        {label} ({items.length})
      </span>
      {/* No inner scroll : the side panel is the only scrolling area */}
      <div className="flex flex-col gap-0.5">{items.map(elemGenerator)}</div>
    </div>
  );
}

export function BookRelationGroup({
  label,
  books,
}: {
  label: string;
  books: SimpleBook[] | null | undefined;
}) {
  return (
    <RelationGroup
      label={label}
      items={books}
      elemGenerator={(bk) => <CompactBookCard key={bk.id} book={bk} />}
    />
  );
}

export function EditionRelationGroup({
  label,
  editions,
  onEditionClick,
}: {
  label: string;
  editions: SimpleEdition[] | null | undefined;
  onEditionClick: (edition: SimpleEdition) => void;
}) {
  return (
    <RelationGroup
      label={label}
      items={editions}
      elemGenerator={(ed) => (
        <CompactEditionCard
          key={ed.id}
          edition={ed}
          onClick={() => onEditionClick(ed)}
        />
      )}
    />
  );
}
