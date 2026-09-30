import { useTranslation } from "~/i18n/i18n";
import type { Book } from "~/models/book";
import type { Issue } from "~/models/issue";
import type { IssueSerie } from "~/models/issue-serie";
import type { Serie } from "~/models/serie";
import { BookList } from "./booklists/BookList";
import { IssueList } from "./issuelists/IssueList";
import { IssueserieList } from "./issueserielists/IssueserieList";
import { SerieList } from "./serielists/SerieList";

interface BookSerieIssueIssueserieListProps {
  data: {
    books: Book[];
    series: Serie[];
    issues: Issue[];
    issueseries: IssueSerie[];
  };
  isLoading?: boolean;
}

export function BookSerieIssueIssueserieList({
  data,
}: BookSerieIssueIssueserieListProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="py-2 border-b border-white/30">
        <p className="text-md text-white/50 font-medium uppercase spacing tracking-wide">
          {t("books")}
        </p>
        <BookList bookList={data.books} />
      </div>
      <div className="py-2 border-b border-white/30">
        <p className="text-md text-white/50 font-medium uppercase spacing tracking-wide">
          {t("series")}
        </p>
        <SerieList serieList={data.series} />
      </div>
      <div className="py-2 border-b border-white/30">
        <p className="text-md text-white/50 font-medium uppercase spacing tracking-wide">
          {t("issueseries")}
        </p>
        <IssueserieList issueserieList={data.issueseries} />
      </div>
      <div className="py-2 border-b border-white/30">
        <p className="text-md text-white/50 font-medium uppercase spacing tracking-wide">
          {t("issues")}
        </p>
        <IssueList issueList={data.issues} />
      </div>
    </div>
  );
}
