import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { buildIssueShortName, type SimpleIssue } from "~/models/issue";

interface IssueNavigationProps {
  previous?: SimpleIssue;
  next?: SimpleIssue;
  isLoading?: boolean;
}

// Links to the previous and next issues of the same issue serie
export function IssueNavigation({
  previous,
  next,
  isLoading,
}: IssueNavigationProps) {
  const { t } = useTranslation();

  // Nothing to navigate to (ex : only issue of its serie)
  if (!isLoading && !previous && !next) return null;

  return (
    <nav className="flex items-stretch justify-between gap-2">
      <IssueNavigationLink
        issue={previous}
        label={t("page.issue.previous")}
        direction="previous"
        isLoading={isLoading}
      />
      <IssueNavigationLink
        issue={next}
        label={t("page.issue.next")}
        direction="next"
        isLoading={isLoading}
      />
    </nav>
  );
}

function IssueNavigationLink({
  issue,
  label,
  direction,
  isLoading,
}: {
  issue?: SimpleIssue;
  label: string;
  direction: "previous" | "next";
  isLoading?: boolean;
}) {
  const isNext = direction === "next";

  if (isLoading) {
    return (
      <span className="w-28 text-sm bg-white/5 rounded border border-white/8 animate-pulse">
        &nbsp;
      </span>
    );
  }
  // Keeps the other link on its side
  if (!issue) return <span />;

  return (
    <Link
      to={`/issue/${issue.id}`}
      title={`${label} : ${issue.name}`}
      aria-label={`${label} : ${buildIssueShortName(issue)}`}
      className={twMerge(
        "flex items-center gap-0.5 min-w-0 max-w-[48%] text-sm text-white/40 hover:underline hover:text-indigo-300 transition-colors",
        isNext && "flex-row-reverse",
      )}
    >
      {isNext ? (
        <MdChevronRight size={16} className="shrink-0" />
      ) : (
        <MdChevronLeft size={16} className="shrink-0" />
      )}
      {/* Only the serie name is truncated, the number always stays visible */}
      <span className="flex min-w-0">
        <span className="truncate">{issue.issueSerieName}</span>
        <span className="shrink-0">&nbsp;#{issue.number}</span>
      </span>
    </Link>
  );
}
