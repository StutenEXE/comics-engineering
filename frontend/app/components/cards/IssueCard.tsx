import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { buildIssueShortName, type SimpleIssue } from "~/models/issue";
import { toDDmmYYYY } from "~/utils/date";

type IssueCardProps = {
  issue: SimpleIssue | null | undefined;
  className?: string;
};

export function IssueCard({ issue, className }: IssueCardProps) {
  const { locale } = useTranslation();

  if (!issue) return null;

  return (
    <Link
      to={`/issue/${issue.id}`}
      className={twMerge("group block w-300", className)}
    >
      <div className="flex items-center justify-between gap-4 px-1 py-2 rounded-md border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all">
        <p className="w-[45%] text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">
          {buildIssueShortName(issue)}
        </p>
        <p className="w-[45%] text-sm text-white/30 shrink-0 truncate">
          {issue.name}
        </p>
        <p className="w-[10%] text-xs text-white/30 shrink-0">
          {toDDmmYYYY(issue.parutionDate, locale)}
        </p>
      </div>
    </Link>
  );
}
