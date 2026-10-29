import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation, type TranslationKeys } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";
import type { SimpleIssue } from "~/models/issue";
import {
  dateToShortMonthYearString,
  dateToVerboseDateString,
} from "~/utils/date";
import { compareIssuesByRelease, formatNumberRanges } from "~/utils/issues";
import { Tooltip } from "../misc/Tooltip";

export interface BookCoverage {
  bookId: number;
  issueIds: number[];
}

// Contiguous slots (indexes in the publication ordered axis), inclusive
interface Run {
  start: number;
  end: number;
}

interface BookBar {
  book: SimpleBook;
  slots: Set<number>;
  runs: Run[];
  numbers: number[];
}

interface SerieBand {
  key: string;
  serieId: number | null;
  serieName: string | null;
  bars: BookBar[];
  // Books that don't overlap share a lane (Gantt view)
  lanes: BookBar[][];
  // Issues covered by at least one book of the serie
  slots: Set<number>;
  runs: Run[];
  numbers: number[];
}

interface Coverage {
  // Axis : issues by publication date, one slot each
  axis: SimpleIssue[];
  // continuous[i] : slots i and i + 1 can belong to the same segment (consecutive numbers)
  continuous: boolean[];
  bands: SerieBand[];
  coveredCount: number;
}


/**
 * Segments of the given slots : a segment never spans a slot outside of them,
 * nor two issues whose numbers don't follow each other (ex : #5 then #8)
 */
function toRuns(slots: Set<number>, continuous: boolean[]): Run[] {
  const runs: Run[] = [];
  for (const slot of [...slots].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1];
    if (last && slot === last.end + 1 && continuous[last.end]) {
      last.end = slot;
    } else {
      runs.push({ start: slot, end: slot });
    }
  }
  return runs;
}

/**
 * Places the books of each serie on the publication ordered axis
 */
export function buildCoverage(
  issues: SimpleIssue[],
  books: SimpleBook[],
  coverage: BookCoverage[],
): Coverage {
  const axis = [...issues].sort(compareIssuesByRelease);
  const continuous = axis.map((issue, i) => {
    const next = axis[i + 1];
    if (!next || issue.number == null || next.number == null) return false;
    const step = next.number - issue.number;
    return step === 0 || step === 1; // Same number : variants
  });
  const slotByIssueId = new Map(axis.map((issue, i) => [issue.id, i]));
  const bookById = new Map(books.map((bk) => [bk.id, bk]));

  // Books grouped by serie
  const barsBySerie = new Map<string, BookBar[]>();
  for (const { bookId, issueIds } of coverage) {
    const book = bookById.get(bookId);
    const slots = new Set(
      issueIds
        .map((id) => slotByIssueId.get(id))
        .filter((slot) => slot !== undefined),
    );
    if (!book || slots.size === 0) continue;

    const key = String(book.serieId ?? "none");
    barsBySerie.set(key, [
      ...(barsBySerie.get(key) ?? []),
      {
        book,
        slots,
        runs: toRuns(slots, continuous),
        numbers: [...slots].map((slot) => axis[slot].number),
      },
    ]);
  }

  const bands: SerieBand[] = [...barsBySerie.entries()].map(([key, bars]) => {
    bars.sort(
      (a, b) =>
        a.runs[0].start - b.runs[0].start ||
        (a.book.number ?? 0) - (b.book.number ?? 0),
    );
    // Greedy packing : each book goes in the first lane free over its whole span
    const lanes: BookBar[][] = [];
    for (const bar of bars) {
      const lane = lanes.find(
        (l) => l[l.length - 1].runs.at(-1)!.end < bar.runs[0].start,
      );
      if (lane) lane.push(bar);
      else lanes.push([bar]);
    }
    const slots = new Set(bars.flatMap((bar) => [...bar.slots]));
    return {
      key,
      serieId: bars[0].book.serieId,
      serieName: bars[0].book.serieName,
      bars,
      lanes,
      slots,
      runs: toRuns(slots, continuous),
      numbers: [...slots].map((slot) => axis[slot].number),
    };
  });
  // Series in reading order
  bands.sort(
    (a, b) =>
      a.runs[0].start - b.runs[0].start ||
      (a.serieName ?? "").localeCompare(b.serieName ?? ""),
  );

  const coveredCount = new Set(bands.flatMap((band) => [...band.slots])).size;

  return { axis, continuous, bands, coveredCount };
}

type TimelineItem =
  | { kind: "book"; bar: BookBar }
  | { kind: "serie"; band: SerieBand };

interface Bracket {
  key: string;
  item: TimelineItem;
  runs: Run[];
  numbers: number[];
  // Column beside the axis : overlapping brackets never share one
  lane: number;
}

const itemKey = (item: TimelineItem) =>
  item.kind === "book" ? `b${item.bar.book.id}` : `s${item.band.key}`;

const slotsOf = (item: TimelineItem) =>
  item.kind === "book" ? item.bar.slots : item.band.slots;

const bracketName = (
  { item }: Bracket,
  t: ReturnType<typeof useTranslation>["t"],
) =>
  item.kind === "book"
    ? item.bar.book.name
    : (item.band.serieName ?? t("generic.unknown"));

/**
 * One bracket per book (or serie), placed in the first column free over its whole span
 */
export function layoutBrackets(
  { bands }: Coverage,
  grouping: Grouping,
): Bracket[] {
  const items: TimelineItem[] =
    grouping === "books"
      ? bands.flatMap((band) =>
          band.bars.map((bar) => ({ kind: "book" as const, bar })),
        )
      : bands.map((band) => ({ kind: "serie" as const, band }));
  const brackets = items.map((item) => ({
    key: itemKey(item),
    item,
    runs: item.kind === "book" ? item.bar.runs : item.band.runs,
    numbers: item.kind === "book" ? item.bar.numbers : item.band.numbers,
    lane: 0,
  }));

  // Shortest first on a same start : it gets the column nearest to the axis
  brackets.sort(
    (a, b) =>
      a.runs[0].start - b.runs[0].start ||
      a.runs.at(-1)!.end - b.runs.at(-1)!.end,
  );
  const laneEnds: number[] = [];
  for (const bracket of brackets) {
    let lane = laneEnds.findIndex((end) => end < bracket.runs[0].start);
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = bracket.runs.at(-1)!.end;
    bracket.lane = lane;
  }
  return brackets;
}

/**
 * Label positions (top) as close as possible to the wanted ones, without overlapping :
 * overlapping labels are stacked in a cluster centered on their wanted positions
 */
export function placeLabels(
  wanted: number[],
  height: number,
  gap: number,
): number[] {
  const step = height + gap;
  const order = wanted.map((_, i) => i).sort((a, b) => wanted[a] - wanted[b]);
  const clusters: { items: number[]; top: number }[] = [];
  const centeredTop = (items: number[]) =>
    Math.max(
      0,
      items.reduce((sum, item, k) => sum + wanted[item] - k * step, 0) /
        items.length,
    );

  for (const i of order) {
    clusters.push({ items: [i], top: Math.max(0, wanted[i]) });
    // Merges with the previous clusters as long as they overlap
    while (clusters.length > 1) {
      const last = clusters[clusters.length - 1];
      const previous = clusters[clusters.length - 2];
      if (previous.top + previous.items.length * step <= last.top) break;
      const items = [...previous.items, ...last.items];
      clusters.splice(-2, 2, { items, top: centeredTop(items) });
    }
  }

  const tops: number[] = [];
  for (const { items, top } of clusters) {
    items.forEach((item, k) => (tops[item] = top + k * step));
  }
  return tops;
}

type Layout = "timeline" | "gantt";
type Grouping = "books" | "series";

interface IssueSerieCoverageTimelineProps {
  issues: SimpleIssue[];
  books: SimpleBook[];
  coverage: BookCoverage[];
  className?: string;
}

/**
 * What the books (or series of books) cover of an issue serie, in publication order
 */
export function IssueSerieCoverageTimeline({
  issues,
  books,
  coverage,
  className,
}: IssueSerieCoverageTimelineProps) {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<Layout>("timeline");
  const [grouping, setGrouping] = useState<Grouping>("books");

  const result = useMemo(
    () => buildCoverage(issues, books, coverage),
    [issues, books, coverage],
  );

  if (result.axis.length === 0) {
    return <p className="text-xs text-white/30">{t("coverage.noIssue")}</p>;
  }

  return (
    <div className={twMerge("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <SegmentedControl
            value={layout}
            options={["timeline", "gantt"]}
            labelKey={(v) => `coverage.layout.${v}`}
            onChange={setLayout}
          />
          <SegmentedControl
            value={grouping}
            options={["books", "series"]}
            labelKey={(v) => `coverage.${v}`}
            onChange={setGrouping}
          />
        </div>
        <span className="text-[11px] text-white/40">
          {t("coverage.covered", {
            parameters: { x: result.coveredCount, y: result.axis.length },
          })}
        </span>
      </div>

      {layout === "timeline" ? (
        <CoverageTimeline coverage={result} grouping={grouping} />
      ) : (
        <CoverageGantt coverage={result} grouping={grouping} />
      )}
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  labelKey,
  onChange,
}: {
  value: T;
  options: T[];
  labelKey: (option: T) => string;
  onChange: (option: T) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex rounded-md border border-white/10 p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={twMerge(
            "px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors",
            value === option
              ? "bg-white/10 text-white/80"
              : "text-white/40 hover:text-white/60",
          )}
        >
          {t(labelKey(option) as TranslationKeys)}
        </button>
      ))}
    </div>
  );
}

function useCountFormatters() {
  const { t } = useTranslation();
  return {
    issues: (count: number) =>
      t(count === 1 ? "coverage.issueCount.one" : "coverage.issueCount", {
        parameters: { x: count },
      }),
    books: (count: number) =>
      t(count === 1 ? "coverage.bookCount.one" : "coverage.bookCount", {
        parameters: { x: count },
      }),
  };
}

/****************
 * TIMELINE VIEW
 ****************/

// Geometry of the timeline, in px
const TICKS_WIDTH = 76;
const AXIS_WIDTH = 8;
const FIRST_LANE = TICKS_WIDTH + AXIS_WIDTH + 8;
const LANE_STEP = 7;
const LEADER_WIDTH = 12;
const LABEL_HEIGHT = 30;
const LABEL_GAP = 4;
const MIN_HEIGHT = 160;
const MIN_SLOT_HEIGHT = 3;
const MAX_SLOT_HEIGHT = 14;
const TICK_SPACING = 80;

/**
 * Vertical axis of the issues by publication date, each book (or serie) as a bracket beside
 * the issues it holds, labelled on the right
 */
function CoverageTimeline({
  coverage,
  grouping,
}: {
  coverage: Coverage;
  grouping: Grouping;
}) {
  const { t } = useTranslation();
  const count = useCountFormatters();
  // Hovered label, or hovered issue on the axis
  const [hoveredKey, setHoveredKey] = useState<string>();
  const [hoveredSlot, setHoveredSlot] = useState<number>();
  const { axis, continuous, bands } = coverage;

  const brackets = useMemo(
    () => layoutBrackets(coverage, grouping),
    [coverage, grouping],
  );

  // Brackets holding the hovered issue, or the hovered label's one
  const highlighted = useMemo(() => {
    if (hoveredSlot !== undefined) {
      return new Set(
        brackets
          .filter((bracket) => slotsOf(bracket.item).has(hoveredSlot))
          .map((bracket) => bracket.key),
      );
    }
    return new Set(hoveredKey ? [hoveredKey] : []);
  }, [brackets, hoveredSlot, hoveredKey]);

  // Vertical scale : tall enough for every label, within readable bounds per issue
  const slotHeight = Math.min(
    MAX_SLOT_HEIGHT,
    Math.max(
      MIN_SLOT_HEIGHT,
      Math.max(MIN_HEIGHT, brackets.length * (LABEL_HEIGHT + LABEL_GAP)) /
        axis.length,
    ),
  );
  const y = (slot: number) => slot * slotHeight;
  const axisHeight = y(axis.length);
  const spanMiddle = (runs: Run[]) =>
    (y(runs[0].start) + y(runs.at(-1)!.end + 1)) / 2;

  const labelTops = placeLabels(
    brackets.map((bracket) => spanMiddle(bracket.runs) - LABEL_HEIGHT / 2),
    LABEL_HEIGHT,
    LABEL_GAP,
  );
  const height = Math.max(
    axisHeight,
    ...labelTops.map((top) => top + LABEL_HEIGHT),
  );

  const laneCount = Math.max(1, ...brackets.map((bracket) => bracket.lane + 1));
  const leaderStart = FIRST_LANE + (laneCount - 1) * LANE_STEP + 4;
  const svgWidth = leaderStart + LEADER_WIDTH;
  const axisRight = TICKS_WIDTH + AXIS_WIDTH;

  // The axis breaks where numbers don't follow each other (ex : issues not in the database)
  const allSlots = new Set(axis.map((_, slot) => slot));
  const coveredSlots = new Set(bands.flatMap((band) => [...band.slots]));
  const axisPieces = toRuns(allSlots, continuous);
  const coveredPieces = toRuns(coveredSlots, continuous);

  const tickCount = Math.min(
    axis.length,
    Math.max(2, Math.floor(axisHeight / TICK_SPACING) + 1),
  );
  const ticks = [
    ...new Set(
      Array.from({ length: tickCount }, (_, i) =>
        Math.round((i * (axis.length - 1)) / Math.max(tickCount - 1, 1)),
      ),
    ),
  ];

  // Issue under the pointer, and where the timeline is on screen (the card is placed beside it)
  const [timelineBox, setTimelineBox] = useState<{ left: number; top: number }>();
  const hoverAt = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const slot = Math.floor((e.clientY - box.top) / slotHeight);
    setHoveredSlot(Math.min(axis.length - 1, Math.max(0, slot)));
    setTimelineBox({ left: box.left, top: box.top });
  };
  // The card doesn't follow a scroll : hidden instead
  useEffect(() => {
    if (hoveredSlot === undefined) return;
    const hide = () => setHoveredSlot(undefined);
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [hoveredSlot === undefined]);

  // Inner part of the slots of a run, so that two neighbouring pieces stay apart
  const pieceRect = (run: Run) => ({
    y: y(run.start) + 1,
    height: Math.max(1, y(run.end + 1) - y(run.start) - 2),
  });

  return (
    <div className="relative flex" style={{ height }}>
      <svg
        width={svgWidth}
        height={height}
        className="shrink-0 overflow-visible"
        aria-hidden
      >
        {/* Ticks : publication year and number */}
        {ticks.map((slot) => {
          const tickY = y(slot) + slotHeight / 2;
          const year = axis[slot].parutionDate?.slice(0, 4);
          return (
            <g key={slot}>
              <text
                x={TICKS_WIDTH - 7}
                y={tickY}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-white/35 text-[10px] tabular-nums"
              >
                {year ? `${year} · ` : ""}#{axis[slot].number}
              </text>
              <line
                x1={TICKS_WIDTH - 4}
                x2={TICKS_WIDTH}
                y1={tickY}
                y2={tickY}
                className="stroke-white/30"
              />
            </g>
          );
        })}

        {/* Axis : outlined pieces, filled where a book holds the issues */}
        {coveredPieces.map((run) => (
          <rect
            key={`c${run.start}`}
            x={TICKS_WIDTH}
            width={AXIS_WIDTH}
            {...pieceRect(run)}
            className="fill-indigo-400/40"
          />
        ))}
        {axisPieces.map((run) => (
          <rect
            key={`a${run.start}`}
            x={TICKS_WIDTH + 0.5}
            width={AXIS_WIDTH - 1}
            rx={1}
            {...pieceRect(run)}
            className="fill-none stroke-white/40"
          />
        ))}

        {/* Brackets + leaders to their label */}
        {brackets.map((bracket, i) => {
          const laneX = FIRST_LANE + bracket.lane * LANE_STEP;
          const isHovered = highlighted.has(bracket.key);
          const labelMiddle = labelTops[i] + LABEL_HEIGHT / 2;
          return (
            <g
              key={bracket.key}
              fill="none"
              strokeWidth={isHovered ? 1.5 : 1}
              className={twMerge(
                isHovered ? "stroke-indigo-300" : "stroke-white/35",
                "transition-colors",
              )}
            >
              {bracket.runs.map((run, r) => {
                const { y: top, height: h } = pieceRect(run);
                const next = bracket.runs[r + 1];
                return (
                  <g key={run.start}>
                    {/* "]" from the axis to the column, over the issues of the run */}
                    <path
                      d={`M${axisRight + 2},${top} H${laneX} V${top + h} H${axisRight + 2}`}
                    />
                    {/* Issues in between, not held by this book */}
                    {next && (
                      <line
                        x1={laneX}
                        x2={laneX}
                        y1={top + h}
                        y2={pieceRect(next).y}
                        strokeDasharray="2 3"
                        className="opacity-50"
                      />
                    )}
                  </g>
                );
              })}
              <path
                d={`M${laneX},${spanMiddle(bracket.runs)} H${leaderStart} L${svgWidth},${labelMiddle}`}
                className="opacity-60"
              />
            </g>
          );
        })}

        {/* Hovered issue : marked on the axis, guide line over the brackets */}
        {hoveredSlot !== undefined && (
          <g className="pointer-events-none">
            <rect
              x={TICKS_WIDTH}
              width={AXIS_WIDTH}
              y={y(hoveredSlot)}
              height={Math.max(2, slotHeight)}
              className="fill-indigo-300"
            />
            <line
              x1={TICKS_WIDTH - 4}
              x2={leaderStart}
              y1={y(hoveredSlot) + slotHeight / 2}
              y2={y(hoveredSlot) + slotHeight / 2}
              strokeDasharray="2 2"
              className="stroke-indigo-300/60"
            />
          </g>
        )}

        {/* Hit area : the issue under the pointer (mouse, pen or finger) */}
        <rect
          x={0}
          y={0}
          width={leaderStart}
          height={axisHeight}
          fill="transparent"
          onPointerMove={hoverAt}
          onPointerDown={hoverAt}
          // A finger lifting also "leaves" : on touch screens, the card stays until the next tap
          onPointerLeave={(e) => {
            if (e.pointerType !== "touch") setHoveredSlot(undefined);
          }}
        />
      </svg>

      {hoveredSlot !== undefined && timelineBox && (
        <IssueHoverCard
          issue={axis[hoveredSlot]}
          holders={brackets
            .filter((bracket) => highlighted.has(bracket.key))
            .map((bracket) => bracketName(bracket, t))}
          isBooks={grouping === "books"}
          timelineLeft={timelineBox.left}
          issueY={timelineBox.top + y(hoveredSlot) + slotHeight / 2}
        />
      )}

      {/* Labels */}
      <div className="relative flex-1 min-w-0">
        {brackets.map((bracket, i) => {
          const ranges = formatNumberRanges(bracket.numbers);
          const { item } = bracket;
          const name = bracketName(bracket, t);
          const detail =
            item.kind === "book"
              ? [ranges, item.bar.book.serieName].filter(Boolean).join(" · ")
              : `${ranges} · ${count.books(item.band.bars.length)}`;
          const to =
            item.kind === "book"
              ? `/book/${item.bar.book.id}`
              : item.band.serieId != null
                ? `/serie/${item.band.serieId}`
                : undefined;
          const isHovered = highlighted.has(bracket.key);
          const content = (
            <>
              <span
                className={twMerge(
                  "block truncate text-[11px] leading-4 transition-colors",
                  isHovered ? "text-indigo-300" : "text-white/75",
                )}
              >
                {name}
              </span>
              <span className="block truncate text-[10px] leading-3.5 text-white/35 tabular-nums">
                {detail}
              </span>
            </>
          );
          const props = {
            title: `${name}\n${detail}`,
            className:
              "absolute inset-x-0 pl-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
            style: { top: labelTops[i], height: LABEL_HEIGHT },
            onMouseEnter: () => setHoveredKey(bracket.key),
            onMouseLeave: () => setHoveredKey(undefined),
            onFocus: () => setHoveredKey(bracket.key),
            onBlur: () => setHoveredKey(undefined),
          };
          return to ? (
            <Link key={bracket.key} to={to} {...props}>
              {content}
            </Link>
          ) : (
            <span key={bracket.key} tabIndex={0} {...props}>
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Above this, the other holders are summed up ("+ 3")
const MAX_HOLDERS_SHOWN = 4;
// Hover card size and distances, in px
const CARD_WIDTH = 224;
const CARD_OFFSET = 10;
const SCREEN_MARGIN = 8;

/**
 * The hovered issue and the books (or series) holding it, on the left of the timeline.
 * Rendered in body : the side panel clips what overflows it
 */
function IssueHoverCard({
  issue,
  holders,
  isBooks,
  timelineLeft,
  issueY,
}: {
  issue: SimpleIssue;
  holders: string[];
  isBooks: boolean;
  // Viewport coordinates
  timelineLeft: number;
  issueY: number;
}) {
  const { t } = useTranslation();
  const shown = holders.slice(0, MAX_HOLDERS_SHOWN);
  const hidden = holders.length - shown.length;

  if (typeof document === "undefined") return null;

  const style: CSSProperties = {
    width: CARD_WIDTH,
    // Stays on screen when there is no room on the left (ex : small screens)
    left: Math.max(SCREEN_MARGIN, timelineLeft - CARD_OFFSET - CARD_WIDTH),
    top: issueY,
    // Centered on the issue, kept inside the screen vertically
    transform: `translateY(clamp(${SCREEN_MARGIN - issueY}px, -50%, calc(${window.innerHeight - SCREEN_MARGIN - issueY}px - 100%)))`,
  };

  return createPortal(
    <div
      role="status"
      className="pointer-events-none fixed z-50 flex flex-col gap-1 rounded-md border border-white/10 bg-zinc-900/95 px-2.5 py-2 shadow-lg shadow-black/40"
      style={style}
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white/85 line-clamp-2">
          <span className="tabular-nums">#{issue.number}</span>
          {issue.name && ` · ${issue.name}`}
        </span>
        {issue.parutionDate && (
          <span className="text-[10px] text-white/40">
            {dateToVerboseDateString(issue.parutionDate)}
          </span>
        )}
      </div>
      {holders.length === 0 ? (
        <span className="text-[11px] italic text-white/40">
          {t(isBooks ? "coverage.inNoBook" : "coverage.inNoSerie")}
        </span>
      ) : (
        <ul className="flex flex-col">
          {shown.map((name, i) => (
            <li key={i} className="text-[11px] text-indigo-300 truncate">
              {name}
            </li>
          ))}
          {hidden > 0 && (
            <li className="text-[11px] text-white/40">+ {hidden}</li>
          )}
        </ul>
      )}
    </div>,
    document.body,
  );
}

/****************
 * GANTT VIEW
 ****************/

/**
 * Global overview : one band per serie, books (or the whole serie) as bars over the axis
 */
function CoverageGantt({
  coverage: { axis, bands },
  grouping,
}: {
  coverage: Coverage;
  grouping: Grouping;
}) {
  const { t } = useTranslation();
  const count = useCountFormatters();
  const slotCount = axis.length;

  return (
    <div className="flex flex-col gap-2">
      <Axis axis={axis} />

      {bands.map((band) => (
        <div key={band.key} className="flex flex-col gap-1">
          {/* Serie */}
          <div className="flex items-baseline justify-between gap-2 min-w-0">
            {band.serieId != null ? (
              <Link
                to={`/serie/${band.serieId}`}
                className="text-[11px] text-white/50 truncate hover:underline hover:text-indigo-300 transition-colors"
              >
                {band.serieName}
              </Link>
            ) : (
              <span className="text-[11px] text-white/50 truncate">
                {t("generic.unknown")}
              </span>
            )}
            <span className="text-[11px] text-white/30 whitespace-nowrap">
              {count.issues(band.slots.size)}
            </span>
          </div>

          {/* Books, packed in lanes */}
          {grouping === "books" &&
            band.lanes.map((lane, i) => (
              <Track key={i}>
                {lane.map((bar) => (
                  <Bar
                    key={bar.book.id}
                    runs={bar.runs}
                    slotCount={slotCount}
                    to={`/book/${bar.book.id}`}
                    label={String(bar.book.number ?? "")}
                    tooltip={
                      <>
                        <p className="font-medium">{bar.book.name}</p>
                        <p className="opacity-70">
                          {t("generic.volume", { capitalize: true })}{" "}
                          {bar.book.number} · {formatNumberRanges(bar.numbers)}
                        </p>
                        <p className="opacity-70">
                          {count.issues(bar.slots.size)}
                        </p>
                      </>
                    }
                    ariaLabel={`${bar.book.name}, ${formatNumberRanges(bar.numbers)}`}
                  />
                ))}
              </Track>
            ))}

          {/* Whole serie */}
          {grouping === "series" && (
            <Track>
              <Bar
                runs={band.runs}
                slotCount={slotCount}
                to={band.serieId != null ? `/serie/${band.serieId}` : undefined}
                tooltip={
                  <>
                    <p className="font-medium">
                      {band.serieName ?? t("generic.unknown")}
                    </p>
                    <p className="opacity-70">
                      {formatNumberRanges(band.numbers)}
                    </p>
                    <p className="opacity-70">
                      {count.issues(band.slots.size)} ·{" "}
                      {count.books(band.bars.length)}
                    </p>
                  </>
                }
                ariaLabel={`${band.serieName ?? t("generic.unknown")}, ${formatNumberRanges(band.numbers)}`}
              />
            </Track>
          )}
        </div>
      ))}

      {/* The bars are an overview : the tooltips hold the exact issues */}
      <p className="text-[11px] italic text-white/30">
        {t("coverage.gantt.hint")}
      </p>
    </div>
  );
}

// Position of slots on the axis, in percent
const slotLeft = (slot: number, slotCount: number) => (slot / slotCount) * 100;
const slotsWidth = (run: Run, slotCount: number) =>
  ((run.end - run.start + 1) / slotCount) * 100;

/**
 * Publication dates : first, last and a few evenly spaced in between
 */
function Axis({ axis }: { axis: SimpleIssue[] }) {
  const count = axis.length;
  const tickCount = Math.min(count, 4);
  const ticks = [
    ...new Set(
      Array.from({ length: tickCount }, (_, i) =>
        Math.round((i * (count - 1)) / Math.max(tickCount - 1, 1)),
      ),
    ),
  ];

  return (
    <div className="relative h-4 border-b border-white/10" aria-hidden>
      {ticks.map((slot, i) => (
        <span
          key={slot}
          className={twMerge(
            "absolute top-0 text-[10px] text-white/30 tabular-nums whitespace-nowrap",
            // The edge labels stay inside the axis
            i === 0
              ? ""
              : i === ticks.length - 1
                ? "-translate-x-full"
                : "-translate-x-1/2",
          )}
          style={{
            left: `${
              i === 0
                ? 0
                : i === ticks.length - 1
                  ? 100
                  : slotLeft(slot + 0.5, count)
            }%`,
          }}
        >
          {dateToShortMonthYearString(axis[slot].parutionDate) ||
            `#${axis[slot].number}`}
        </span>
      ))}
    </div>
  );
}

/**
 * One row of the Gantt : the background shows the uncovered issues
 */
function Track({ children }: { children: ReactNode }) {
  return <div className="relative h-4 rounded-sm bg-white/5">{children}</div>;
}

interface BarProps {
  runs: Run[];
  slotCount: number;
  to?: string;
  label?: string;
  tooltip: ReactNode;
  ariaLabel: string;
}

/**
 * Covered issues of a book or serie : one segment per run
 */
function Bar({ runs, slotCount, to, label, tooltip, ariaLabel }: BarProps) {
  const first = runs[0];
  const last = runs[runs.length - 1];
  const span = { start: first.start, end: last.end };
  const spanLength = span.end - span.start + 1;

  // The whole span is the hover / click target (lanes never hold overlapping spans)
  const triggerProps = {
    "aria-label": ariaLabel,
    className:
      "group absolute inset-y-0 block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
    style: {
      left: `${slotLeft(span.start, slotCount)}%`,
      width: `${slotsWidth(span, slotCount)}%`,
    },
  };

  const content = (
    <>
      {runs.map((run) => (
        <span
          key={run.start}
          className="@container absolute inset-y-0 flex items-center justify-center rounded-sm bg-indigo-400/70 group-hover:bg-indigo-300 transition-colors"
          style={{
            // 2px gap between neighbouring segments, kept visible when an issue is very narrow
            left: `calc(${((run.start - span.start) / spanLength) * 100}% + 1px)`,
            width: `max(2px, calc(${((run.end - run.start + 1) / spanLength) * 100}% - 2px))`,
          }}
        >
          {/* Only when it fits */}
          {label && run === first && (
            <span className="hidden @min-[1rem]:inline text-[10px] font-medium leading-none text-black/70 tabular-nums">
              {label}
            </span>
          )}
        </span>
      ))}
    </>
  );

  return (
    <Tooltip
      trigger={
        to ? (
          <Link to={to} {...triggerProps}>
            {content}
          </Link>
        ) : (
          <span tabIndex={0} {...triggerProps}>
            {content}
          </span>
        )
      }
      content={<div className="flex flex-col gap-0.5 text-xs">{tooltip}</div>}
    />
  );
}
