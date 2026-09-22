import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n.js";
import type { Book } from "~/models/book.js";
import type { IssueSerie } from "~/models/issue-serie.js";
import {
  issueToSimpleIssue,
  type Issue,
  type SimpleIssue,
} from "~/models/issue.js";
import type { Serie } from "~/models/serie.js";
import { useLazyIssueBySerieIdQuery } from "~/store/services/api.js";
import { toDDmmYYYY } from "~/utils/date.js";

export type Comparable = {
  label: string;
  type: "edition" | "book" | "serie" | "issueserie" | "issue";
  data: Record<string, any>;
};

interface ComparatorProps {
  itemA?: Comparable;
  itemB?: Comparable;
  removeItemA: () => void;
  removeItemB: () => void;
}

type RowState = "equal" | "added" | "missing";

type IssueRow = {
  key: number;
  left: {
    issue?: SimpleIssue;
    state: RowState;
  };
  right: {
    issue?: SimpleIssue;
    state: RowState;
  };
  diff: "left+1" | "right+1" | "none";
};

type IssueBySerieQueryTrigger = (args: {
  id: number;
}) => Promise<{ data?: { issues?: Issue[] } } | undefined>;

function formatIssueLabel(
  issue: SimpleIssue | undefined,
  locale: string,
): string {
  if (!issue) return "";
  return `${issue.issueSerieName} #${issue.number} (${toDDmmYYYY(issue.parutionDate, locale)})`;
}

async function getIssues(
  item?: Comparable,
  getIssuesBySerie?: IssueBySerieQueryTrigger,
): Promise<SimpleIssue[]> {
  if (!item) return [];
  switch (item.type) {
    case "edition":
      return [];
    case "book":
      return (item.data as Book).issues;
    case "serie": {
      const serieId = (item.data as Serie).id;
      if (!getIssuesBySerie) return [];
      const response = await getIssuesBySerie({ id: serieId });
      return response?.data?.issues?.map((is) => issueToSimpleIssue(is)) || [];
    }
    case "issueserie":
      return (item.data as IssueSerie).issues;
    case "issue":
      return [item.data as Issue];
    default:
      return [];
  }
}

async function getIssueSummaryRows(
  itemA?: Comparable,
  itemB?: Comparable,
  getIssuesBySerie?: IssueBySerieQueryTrigger,
): Promise<IssueRow[]> {
  const leftIssues = await getIssues(itemA, getIssuesBySerie);
  const rightIssues = await getIssues(itemB, getIssuesBySerie);
  const leftMap = new Map<number, SimpleIssue>();
  const rightMap = new Map<number, SimpleIssue>();

  leftIssues.forEach((issue) => leftMap.set(issue.id, issue));
  rightIssues.forEach((issue) => rightMap.set(issue.id, issue));

  const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
  const allIssues: SimpleIssue[] = [];
  allKeys.forEach((key: number) => {
    const issue = leftMap.get(key) ?? rightMap.get(key);
    if (!issue) return;
    allIssues.push(issue);
  });

  return [...allIssues]
    .sort((a, b) => dayjs(a.parutionDate).diff(dayjs(b.parutionDate)))
    .map((issue) => {
      const left = leftMap.get(issue.id);
      const right = rightMap.get(issue.id);

      const getState = (self?: SimpleIssue, other?: SimpleIssue) => {
        // !self && !other = impossible
        if (!self) return "missing";
        if (!other) return "added";
        return "equal";
      };

      return {
        key: issue.id,
        left: {
          issue: left,
          state: getState(left, right),
        },
        right: {
          issue: right,
          state: getState(right, left),
        },
        diff: right && !left ? "right+1" : left && !right ? "left+1" : "none",
      };
    });
}

function buildSummary(rows: IssueRow[]) {
  const summary = { totalDiff: 0, moreInLeft: 0, moreInRight: 0, nCommon: 0 };

  rows.forEach((row) => {
    if (row.diff === "none") {
      summary.nCommon++;
      return;
    }
    summary.totalDiff++;
    if (row.diff == "left+1") summary.moreInLeft++;
    else summary.moreInRight++;
  });

  return summary;
}

function getIssueRowClassName(state: RowState) {
  switch (state) {
    case "added":
      return "border border-green-500/30 bg-green-400/30 text-green-400";
    case "equal":
      return "bg-transparent text-white";
    case "missing":
      return "bg-transparent";
  }
}

export function Comparator({
  itemA,
  itemB,
  removeItemA,
  removeItemB,
}: ComparatorProps) {
  const { t } = useTranslation();
  const [getIssuesBySerie] = useLazyIssueBySerieIdQuery();

  const sameType = itemA?.type === itemB?.type;
  const [issueRows, setIssueRows] = useState<IssueRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadIssues = async () => {
      const issues = await getIssueSummaryRows(itemA, itemB, getIssuesBySerie);
      if (isMounted) setIssueRows(issues);
    };

    void loadIssues();

    return () => {
      isMounted = false;
    };
  }, [itemA, itemB, getIssuesBySerie]);

  const summary = buildSummary(issueRows);

  return (
    <div className="overflow-hidden rounded-lg border border-white/30">
      <div className="grid grid-cols-2 border-b border-white/30 text-sm font-semibold">
        <div className="flex justify-between items-center border-r border-white/30 px-3 py-2">
          {itemA ? t(itemA.type) : t("compare.missingA")}
          <MdDelete
            onClick={removeItemA}
            size={18}
            className={twMerge(
              "text-red-500 hover:text-red-400 cursor-pointer transition-colors cursor-pointer",
              itemA === undefined &&
                "text-muted hover:text-red-muted cursor-not-allowed",
            )}
          />
        </div>
        <div className="flex justify-between px-3 py-2">
          {itemB ? t(itemB.type) : t("compare.missingB")}
          <MdDelete
            onClick={removeItemB}
            size={18}
            className={twMerge(
              "text-red-500 hover:text-red-400 cursor-pointer transition-colors cursor-pointer",
              itemB === undefined &&
                "text-muted hover:text-red-muted cursor-not-allowed",
            )}
          />
        </div>
      </div>

      <div className="p-3">
        {/*  Comparaison */}
        TO CREATE
      </div>

      <div className="border-t border-white/30 p-3">
        <div className="mb-2 text-white font-bold text-ms">Issues</div>

        <div className="overflow-hidden min-h-[36px] rounded-md border border-gray-500/30">
          <div className="grid grid-cols-2 bg-neutral-900 border-b border-gray-500/30 text-sm font-semibold">
            <div className="border-r border-gray-500/30 px-3 py-2">
              {itemA?.label}
            </div>
            <div className="px-3 py-2">{itemB?.label}</div>
          </div>

          {issueRows.length === 0 ? (
            <div className="px-3 py-3 text-sm">
              No issues available for comparison.
            </div>
          ) : (
            issueRows.map((row) => <IssueRowComp key={row.key} row={row} />)
          )}
        </div>
        <div className="px-2 py-2.5 text-sm">
          <div className="mb-1 font-bold">Recap</div>
          <div className="text-xs">
            Total difference: {summary.totalDiff} · Left additions:{" "}
            {summary.moreInLeft} · Right additions: {summary.moreInRight} ·
            Common: {summary.nCommon}
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueRowComp({ row }: { row: IssueRow }) {
  const { locale } = useTranslation();
  const lRowClassName = getIssueRowClassName(row.left.state);
  const rRowClassName = getIssueRowClassName(row.right.state);

  return (
    <div
      key={row.key}
      className="grid min-h-[24px] grid-cols-2 items-center gap-0 border-b border-[#30363d] text-xs leading-[1.4]"
    >
      {row.left.state === "missing" ? (
        <MissingRow />
      ) : (
        <div
          className={`flex min-h-full items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap pl-2 ${lRowClassName}`}
        >
          {row.left.state === "added" ? (
            <span className="font-bold">+</span>
          ) : (
            <span className="text-[#8b949e]">=</span>
          )}
          <span>{formatIssueLabel(row.left.issue, locale)}</span>
        </div>
      )}
      {row.right.state === "missing" ? (
        <MissingRow />
      ) : (
        <div
          className={`flex min-h-full items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap pl-2 ${rRowClassName}`}
        >
          {row.right.state === "added" ? (
            <span className="font-bold">+</span>
          ) : (
            <span className="text-[#8b949e]">=</span>
          )}
          <span>{formatIssueLabel(row.right.issue, locale)}</span>
        </div>
      )}
    </div>
  );
}

function MissingRow() {
  return (
    <span
      className="block min-h-full w-full border border-[#30363d]"
      style={{
        display: "block",
        height: "1.5em",
        backgroundImage:
          "repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1) 5px, transparent 5px, transparent 10px)",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
    ></span>
  );
}
