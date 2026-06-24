import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";

type IssueSerieCardProps = {
  issueserie?: SimpleIssueSerie;
  className?: string;
};

export function IssueSerieCard({ issueserie, className }: IssueSerieCardProps) {
  const { t, locale } = useTranslation();

  if (!issueserie) return null;

  const issueserieLabel = issueserie.endDate
    ? // End date defined
      `${dateToMonthYearString(locale, issueserie.startDate)} - ${dateToMonthYearString(locale, issueserie.endDate)}`
    : `${dateToMonthYearString(locale, issueserie.startDate)} - ${t("generic.ongoing")}`;

  return (
    <Link
      to={`/issueserie/${issueserie.id}`}
      className={twMerge("group block w-300", className)}
    >
      <div className="flex items-center justify-between gap-4 px-1 py-2 rounded-md border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all">
        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate whitespace-nowrap">
          {issueserie.name}
        </p>
        <p className="text-xs text-white/30 shrink-0">{issueserieLabel}</p>
      </div>
    </Link>
  );
}
