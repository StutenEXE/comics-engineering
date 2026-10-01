import type { ReactNode } from "react";
import { useTranslation } from "~/i18n/i18n";
import type { Book } from "~/models/book";
import type { Edition, SimpleEdition } from "~/models/edition";
import type { Issue } from "~/models/issue";
import type { IssueSerie } from "~/models/issue-serie";
import type { Serie } from "~/models/serie";
import { BookList } from "./booklists/BookList";
import { EditionList } from "./editionlists/EditionList";
import { IssueList } from "./issuelists/IssueList";
import { IssueserieList } from "./issueserielists/IssueserieList";
import { SerieList } from "./serielists/SerieList";

export type AllItemsType =
  | "books"
  | "series"
  | "issueseries"
  | "issues"
  | "editions";

export const ALL_ITEMS_TYPES: AllItemsType[] = [
  "books",
  "series",
  "issueseries",
  "issues",
  "editions",
];

interface AllItemsListProps {
  data: {
    books?: Book[];
    series?: Serie[];
    issues?: Issue[];
    issueseries?: IssueSerie[];
    editions?: Edition[] | SimpleEdition[];
  };
  /** Sections to display. Defaults to every type. Order is always ALL_ITEMS_TYPES. */
  types?: AllItemsType[];
  isLoading?: boolean;
}

export function AllItemsList({
  data,
  types = ALL_ITEMS_TYPES,
  isLoading,
}: AllItemsListProps) {
  const { t } = useTranslation();

  const lists: Record<AllItemsType, () => ReactNode> = {
    books: () => <BookList bookList={data.books} />,
    series: () => <SerieList serieList={data.series} />,
    issueseries: () => <IssueserieList issueserieList={data.issueseries} />,
    issues: () => <IssueList issueList={data.issues} />,
    editions: () => (
      <EditionList editionList={data.editions} isLoading={isLoading} />
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {ALL_ITEMS_TYPES.filter((type) => types.includes(type)).map((type) => (
        <div key={type} className="py-2 border-b border-white/30">
          <p className="text-md text-white/50 font-medium uppercase spacing tracking-wide">
            {t(type)}
          </p>
          {lists[type]()}
        </div>
      ))}
    </div>
  );
}
