import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation, type TranslationKeys } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  getFieldChanges,
  isReference,
  isReferenceList,
  type Contribution,
  type FieldChange,
} from "~/models/contribution";
import { useContributionHistoryQuery } from "~/store/services/api";
import { toDDmmYYYY } from "~/utils/date";
import { SkeletonText } from "../misc/Skeleton";

// Label of each field that a contribution can change
const FIELD_LABELS: Record<ContributionTypeEnum, Record<string, TranslationKeys>> = {
  [ContributionTypeEnum.BOOK]: {
    name: "book.name",
    desc: "book.description",
    number: "book.number",
    voContent: "book.voContent",
    imgUrl: "book.imgUrl",
    serie: "book.serie",
    issues: "book.issues",
  },
  [ContributionTypeEnum.SERIE]: {
    name: "serie.name",
    ongoing: "serie.ongoing",
    oneshot: "serie.oneshot",
    nvolumes: "serie.nvolumes",
  },
  [ContributionTypeEnum.ISSUE]: {
    name: "issue.name",
    number: "issue.number",
    coverDate: "issue.coverDate",
    parutionDate: "issue.parutionDate",
    fandomUrl: "issue.fandomUrl",
    issueSerie: "issue.serie",
  },
  [ContributionTypeEnum.ISSUE_SERIE]: {
    name: "issueserie.name",
    desc: "issueserie.description",
    startDate: "issueserie.startDate",
    endDate: "issueserie.endDate",
    fandomUrl: "issueserie.fandomUrl",
  },
  [ContributionTypeEnum.EDITION]: {
    isbn: "edition.isbn",
    ean: "edition.ean",
    npages: "edition.npages",
    price: "edition.price",
    url: "edition.url",
    imgUrl: "edition.imgUrl",
    coverType: "edition.coverType",
    parutionDate: "edition.parutionDate",
    dimensions: "edition.dimensions",
    publisher: "edition.publisher",
    book: "edition.book",
  },
  [ContributionTypeEnum.PUBLISHER]: {}, // No publisher page
};

const ACTION_DOT_STYLES: Record<ContributionActionEnum, string> = {
  [ContributionActionEnum.CREATE]: "bg-green-400/70",
  [ContributionActionEnum.UPDATE]: "bg-indigo-400/70",
  [ContributionActionEnum.DELETE]: "bg-red-400/70",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\//;

interface ContributionHistoryTimelineProps {
  type: ContributionTypeEnum;
  id?: number;
  className?: string;
}

/**
 * Vertical timeline of the approved changes of an item, latest first
 */
export function ContributionHistoryTimeline({
  type,
  id,
  className,
}: ContributionHistoryTimelineProps) {
  const { t } = useTranslation();
  const { data, isFetching, isError } = useContributionHistoryQuery(
    { type, id: id! },
    { skip: id == null },
  );
  const contributions = data?.contributions ?? [];

  return (
    <div className={twMerge("flex flex-col gap-3", className)}>
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
        {t("history.title")}
      </span>

      {isFetching && <SkeletonText lines={4} />}

      {!isFetching && isError && (
        <p className="text-xs text-white/30">{t("generic.errorOccured")}</p>
      )}

      {!isFetching && !isError && contributions.length === 0 && (
        <p className="text-xs text-white/30">{t("history.empty")}</p>
      )}

      {!isFetching && !isError && contributions.length > 0 && (
        <ol className="flex flex-col gap-5 border-l border-white/10 ml-1">
          {contributions.map((c) => (
            <TimelineEntry key={c.id} contribution={c} />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineEntry({ contribution: c }: { contribution: Contribution }) {
  const { t, locale } = useTranslation();
  // Only the fields a contribution can change (old snapshots also hold derived data)
  const changes = getFieldChanges(c).filter(
    (change) => FIELD_LABELS[c.entityType]?.[change.field],
  );

  return (
    <li className="relative pl-4">
      {/* Dot on the line */}
      <span
        className={twMerge(
          "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full",
          ACTION_DOT_STYLES[c.action],
        )}
      />

      {/* Action + date */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-white/80">
          {t(`contribution.enum.action.${c.action}`)}
        </span>
        {c.bundle?.createdAt && (
          <time className="text-xs text-white/30 whitespace-nowrap">
            {toDDmmYYYY(c.bundle.createdAt, locale)}
          </time>
        )}
      </div>

      {/* Submitter */}
      {c.bundle?.submitterUsername && (
        <p className="text-xs text-white/30">
          {t("history.by")}&nbsp;
          <Link
            to={`/profile/${c.bundle.submitterId}`}
            className="text-white/50 hover:underline hover:text-indigo-300 transition-colors"
          >
            {c.bundle.submitterUsername}
          </Link>
        </p>
      )}

      {/* Note left by the submitter */}
      {c.bundle?.note && (
        <p
          className="mt-1 text-xs italic text-white/40 line-clamp-2"
          title={c.bundle.note}
        >
          « {c.bundle.note} »
        </p>
      )}

      {/* Changed fields */}
      {c.action === ContributionActionEnum.UPDATE && (
        <div className="mt-2 flex flex-col gap-2">
          {changes.length === 0 && (
            <p className="text-xs text-white/30">{t("history.noChange")}</p>
          )}
          {changes.map((change) => (
            <FieldChangeRow
              key={change.field}
              type={c.entityType}
              change={change}
            />
          ))}
        </div>
      )}
    </li>
  );
}

function FieldChangeRow({
  type,
  change,
}: {
  type: ContributionTypeEnum;
  change: FieldChange;
}) {
  const { t } = useTranslation();
  const label = t(FIELD_LABELS[type][change.field]);

  // Lists of references : what was added and removed
  const before = change.before ?? [];
  const after = change.after ?? [];
  if (isReferenceList(before) && isReferenceList(after)) {
    const beforeIds = new Set(before.map((r) => r.id));
    const afterIds = new Set(after.map((r) => r.id));
    const added = after.filter((r) => !beforeIds.has(r.id));
    const removed = before.filter((r) => !afterIds.has(r.id));
    return (
      <div className="flex flex-col gap-0.5 rounded-md bg-white/3 px-2 py-1.5">
        <span className="text-[11px] uppercase tracking-wider text-white/30">
          {label}
        </span>
        {added.map((r) => (
          <span key={`+${r.id}`} className="text-xs text-green-400/70">
            + {formatReference(r)}
          </span>
        ))}
        {removed.map((r) => (
          <span key={`-${r.id}`} className="text-xs text-red-400/70">
            − {formatReference(r)}
          </span>
        ))}
      </div>
    );
  }

  // Images : the previous image is deleted from the storage when it is replaced,
  // only the new one can be shown
  if (change.field === "imgUrl") {
    return (
      <div className="flex flex-col gap-1 rounded-md bg-white/3 px-2 py-1.5 min-w-0">
        <span className="text-[11px] uppercase tracking-wider text-white/30">
          {label}
        </span>
        <FieldImage url={change.after} />
        {change.before && (
          <span className="text-[11px] italic text-white/25">
            {t("history.previousImageNotKept")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-white/3 px-2 py-1.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-white/30">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs min-w-0">
        <span className="text-white/35 line-through decoration-white/20 min-w-0 break-words">
          <FieldValue value={change.before} />
        </span>
        <span className="text-white/25">→</span>
        <span className="text-white/80 min-w-0 break-words">
          <FieldValue value={change.after} />
        </span>
      </div>
    </div>
  );
}

function FieldValue({ value }: { value: any }): ReactNode {
  const { t, locale } = useTranslation();

  if (value === null || value === undefined || value === "") {
    return <span className="italic no-underline">—</span>;
  }
  if (typeof value === "boolean") {
    return t(value ? "generic.yes" : "generic.no");
  }
  if (typeof value === "string") {
    if (DATE_PATTERN.test(value)) {
      return toDDmmYYYY(value, locale);
    }
    if (URL_PATTERN.test(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          title={value}
          className="inline-flex hover:text-indigo-300 transition-colors"
        >
          <span className="truncate max-w-48">{formatUrl(value)}&nbsp;↗</span>
        </a>
      );
    }
    return (
      <span className="line-clamp-3" title={value}>
        {value}
      </span>
    );
  }
  if (isReference(value)) {
    return formatReference(value);
  }
  if (typeof value === "object") {
    // Ex : dimensions
    return Object.values(value)
      .filter((v) => v !== null && v !== undefined)
      .join(" × ");
  }
  return String(value);
}

/**
 * Thumbnail of the proposed image : it is the url given by the contributor
 * (often an external site), it can disappear too
 */
function FieldImage({ url }: { url?: string | null }) {
  const { t } = useTranslation();
  const [isBroken, setIsBroken] = useState(false);

  if (!url) {
    return <span className="text-xs italic text-white/35">—</span>;
  }
  if (isBroken) {
    return (
      <span className="text-xs italic text-white/35">
        {t("history.imageUnavailable")}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="w-fit"
    >
      <img
        src={url}
        alt=""
        onError={() => setIsBroken(true)}
        className="h-16 rounded border border-white/10 object-cover"
      />
    </a>
  );
}

function formatReference(r: Record<string, any>): string {
  // Issues linked to a book
  if (r.issueSerieName && r.number != null) {
    return `${r.issueSerieName} #${r.number}`;
  }
  return r.name ?? `#${r.id}`;
}

function formatUrl(url: string): string {
  return url.replace(URL_PATTERN, "").replace(/^www\./, "");
}
