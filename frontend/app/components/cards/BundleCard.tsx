import { deepCopy } from "~/utils/object";
import { IndentedContributionList } from "../lists/contributionlists/IndentedContributionList";
import { FaChevronDown } from "react-icons/fa6";
import { CiCalendar, CiUser } from "react-icons/ci";
import type { ContributionBundle } from "~/models/contributionBundle";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { dateToVerboseDateString } from "~/utils/date";
import { useTranslation } from "~/i18n/i18n";

type BundleCardProps = {
  bundle: ContributionBundle;
  className?: string;
};

export function BundleCard({ bundle, className }: BundleCardProps) {
  const { locale, t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!bundle) return null;

  return (
    <div
      className={twMerge(
        "rounded-lg border border-white/8 bg-white/3 overflow-hidden transition-all",
        expanded && "border-indigo-500/20 bg-white/5",
        className,
      )}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="text-xs font-mono text-white/25 shrink-0">
          #{bundle.id}
        </span>

        <span className="flex-1 text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">
          {bundle.note ?? (
            <span className="italic text-white/25">{t("cbundle.nonote")}</span>
          )}
        </span>

        {bundle.submitter && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/30 shrink-0">
            <CiUser size={13} />
            {bundle.submitter.username}
          </span>
        )}

        <span className="text-xs text-indigo-300/60 border border-indigo-500/20 rounded-full px-2 py-0.5 shrink-0">
          {bundle.contributions.length} {t("cbundle.contributions")}
        </span>

        <FaChevronDown
          size={11}
          className={`text-white/20 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-white/8">
          {/* Meta bar */}
          <div className="flex items-center gap-4 px-4 py-2 bg-white/3">
            <span className="flex items-center gap-1.5 text-xs text-white/25">
              <CiCalendar size={13} />
              {dateToVerboseDateString(locale, bundle.createdAt)}
            </span>
            <span className="text-white/10">·</span>
            <span className="text-xs text-white/25">
              {t("cbundle.modified")}{" "}
              {dateToVerboseDateString(locale, bundle.modifiedAt)}
            </span>
          </div>

          {/* Note */}
          {bundle.note && (
            <div className="px-4 pt-3 pb-2 flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-widest text-white/30">
                {t("cbundle.note")}
              </span>
              <p className="text-sm text-white/60 leading-relaxed bg-white/5 border border-white/8 rounded-md px-3 py-2.5">
                {bundle.note}
              </p>
            </div>
          )}

          {/* Contributions */}
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-widest text-white/30">
              {t("cbundle.contributions")}
            </span>
            <div className="border border-white/8 rounded-md overflow-hidden">
              <IndentedContributionList
                contributionList={deepCopy(bundle.contributions)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
