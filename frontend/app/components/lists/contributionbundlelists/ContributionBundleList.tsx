import { useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionStatusEnum,
  getContributionName,
  type SimpleContribution,
} from "~/models/contribution";
import {
  ContributionBundleStatusEnum,
  type ContributionBundle,
} from "~/models/contributionBundle";
import { IndentedContributionList } from "../contributionlists/IndentedContributionList";
import { deepCopy } from "~/utils/object";
import { BundleCard } from "~/components/cards/BundleCard";

// ─── Style maps ───────────────────────────────────────────────────────────────
const BUNDLE_STATUS_STYLES: Record<ContributionBundleStatusEnum, string> = {
  [ContributionBundleStatusEnum.PENDING]:
    "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  [ContributionBundleStatusEnum.NEEDS_REVISION]:
    "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  [ContributionBundleStatusEnum.APPROVED]:
    "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  [ContributionBundleStatusEnum.REJECTED]:
    "bg-red-50 text-red-800 ring-1 ring-red-200",
};

const CONTRIB_STATUS_STYLES: Record<ContributionStatusEnum, string> = {
  [ContributionStatusEnum.PENDING]:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  [ContributionStatusEnum.NEEDS_REVISION]:
    "bg-blue-50 text-orange-700 ring-1 ring-orange-200",
  [ContributionStatusEnum.SKIPPED]:
    "bg-blue-50 text-purple-700 ring-1 ring-purple-200",
  [ContributionStatusEnum.APPROVED]:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  [ContributionStatusEnum.REJECTED]:
    "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const ACTION_STYLES: Record<ContributionActionEnum, string> = {
  [ContributionActionEnum.CREATE]: "bg-emerald-50 text-emerald-700",
  [ContributionActionEnum.UPDATE]: "bg-amber-50 text-amber-700",
  [ContributionActionEnum.DELETE]: "bg-red-50 text-red-700",
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const InboxIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.1 13.177a2.25 2.25 0 0 0-.1.661Z"
    />
  </svg>
);

interface ContributionBundleListProps {
  bundles: ContributionBundle[];
  /**
   * When provided the component acts in controlled mode:
   * the status filter UI is hidden and this value is used instead.
   */
  statusFilter?: ContributionBundleStatusEnum | "all";
  className?: string;
}

export default function ContributionBundleList({
  bundles,
  statusFilter,
  className = "",
}: ContributionBundleListProps) {
  const [internalFilter, setInternalFilter] = useState<
    ContributionBundleStatusEnum | "all"
  >("all");
  const [search, setSearch] = useState("");

  const isControlled = statusFilter !== undefined;
  const activeFilter = isControlled ? statusFilter : internalFilter;

  const filtered = bundles.filter((b) => {
    const matchStatus = activeFilter === "all" || b.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.note.toLowerCase().includes(q) ||
      b.submitter?.username.toLowerCase().includes(q) ||
      String(b.id).includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Toolbar — hidden in controlled mode */}
      {!isControlled && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by note, submitter, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
            />
          </div>

          <select
            value={internalFilter}
            onChange={(e) =>
              setInternalFilter(
                e.target.value as ContributionBundleStatusEnum | "all",
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition bg-white"
          >
            <option value="all">All statuses</option>
            {Object.values(ContributionBundleStatusEnum).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      {filtered.length > 0 ? (
        filtered.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <InboxIcon className="w-8 h-8" />
          <p className="text-sm">No bundles match your filters.</p>
        </div>
      )}
    </div>
  );
}
