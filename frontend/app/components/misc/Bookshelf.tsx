import { use, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import type { OwnedEdition } from "~/models/ownedEdition";
import { SelectInput } from "../forms/fields/SelectInput";
import {
  TbSortAscendingLetters,
  TbSortDescendingLetters,
} from "react-icons/tb";
import { useTranslation } from "~/i18n/i18n";

//===== Color palette (dark wood theme)=====
const WOOD_DARK = "#3B1F0A"; // deep background for shelf interior depth
const WOOD_MID = "#6B3A1F"; // shelf plank fill
const WOOD_LIGHT = "#8B4A2A"; // highlight edges (top of planks, frame bevel)
const WOOD_FRAME = "#7A3B1C"; // outer frame face
const WOOD_GRAIN = "#5C2E0E"; // grain lines drawn over planks

// At least 3 rows so an empty shelf still looks like a shelf
const MIN_ROWS = 3;

interface ShelfDimensions {
  /** Height of each book row in cm */
  rowHeightCm?: number;
  /** Total shelf width in cm */
  shelfWidthCm?: number;
  /** Thickness of the wooden plank between rows in cm */
  plankThicknessCm?: number;
  /** Outer frame border width in cm */
  frameBorderCm?: number;
}

interface BookshelfProps {
  oeditions?: OwnedEdition[];
  onClick?: (oe: OwnedEdition) => void;
  sortable?: boolean;
  dimensions?: ShelfDimensions;
  isLoading?: boolean;
  className?: string;
}

// Sort by series name (alphabetical), then by volume number within a series
// Books without a series are sorted to the back
function sortBySerie(a: OwnedEdition, b: OwnedEdition, asc: boolean) {
  if (!a?.edition?.serie?.name) return 1;
  if (!b?.edition?.serie?.name) return -1;
  const serieComp =
    (asc ? 1 : -1) * a.edition.serie.name.localeCompare(b.edition.serie.name);
  if (serieComp !== 0) return serieComp;
  return (a.edition.book?.number ?? 0) - (b.edition.book?.number ?? 0);
}

// Sort by height (if same height, use sort by serie)
// Books without a height are sorted to the back
function sortByHeight(a: OwnedEdition, b: OwnedEdition, asc: boolean) {
  if (!a.edition?.dimensions?.height) return 1;
  if (!b.edition?.dimensions?.height) return -1;
  const heightComp =
    (asc ? 1 : -1) *
    (a.edition?.dimensions?.height - b.edition?.dimensions?.height);
  if (heightComp !== 0) return heightComp;
  return sortBySerie(a, b, true);
}

// Sort by thickness (if same width, use sort by serie)
// Books without a width are sorted to the back
function sortByThickness(a: OwnedEdition, b: OwnedEdition, asc: boolean) {
  if (!a.edition?.dimensions?.thickness) return 1;
  if (!b.edition?.dimensions?.thickness) return -1;
  const thicknessComp =
    (asc ? 1 : -1) *
    (a.edition?.dimensions?.thickness - b.edition?.dimensions?.thickness);
  if (thicknessComp !== 0) return thicknessComp;
  return sortBySerie(a, b, true);
}

const sortingAlgorithmsRegistry = {
  sortBySerie,
  sortByHeight,
  sortByThickness,
};

export function Bookshelf({
  oeditions = [],
  onClick,
  dimensions = {},
  sortable = true,
  isLoading = false,
  className,
}: BookshelfProps) {
  const { t } = useTranslation();

  // Define base values
  const {
    rowHeightCm = 30,
    shelfWidthCm = 100,
    plankThicknessCm = 2,
    frameBorderCm = 3,
  } = dimensions;
  //===== Layout constants (all in SVG units; 1 unit = 1mm at LIFE_TO_RENDER_SCALE=10) =====
  const LIFE_TO_RENDER_SCALE = 10;
  const HEIGHT_OF_SHELF_ROW = rowHeightCm * LIFE_TO_RENDER_SCALE;
  const WIDTH_OF_SHELF = shelfWidthCm * LIFE_TO_RENDER_SCALE;
  const TEXT_TOP_PADDING = 1 * LIFE_TO_RENDER_SCALE;
  const TEXT_BOTTOM_PADDING = 1 * LIFE_TO_RENDER_SCALE;
  const SHELF_PLANK_THICKNESS = plankThicknessCm * LIFE_TO_RENDER_SCALE;
  const FRAME_BORDER = frameBorderCm * LIFE_TO_RENDER_SCALE;

  // Sorting algorithm change
  const [sortingAlgorithm, setSortingAlgorithm] = useState(() => sortBySerie); // Wrap in a function prevent it being used as a lazy initializer
  // Ascending or descending sorting
  const [ascSort, setAscSort] = useState(true);
  const sortedEditions = [...oeditions].sort((a, b) =>
    sortingAlgorithm(a, b, ascSort),
  );

  const INNER_WIDTH = WIDTH_OF_SHELF - FRAME_BORDER * 2;

  //===== Row packing: greedily fill each row left-to-right by book spine thickness =====
  type Row = { editions: OwnedEdition[]; totalWidth: number };
  const rows: Row[] = [];
  let currentRow: Row = { editions: [], totalWidth: 0 };

  for (const oe of sortedEditions) {
    const thickness = oe.edition.dimensions.thickness * LIFE_TO_RENDER_SCALE;
    if (
      currentRow.totalWidth + thickness > INNER_WIDTH &&
      currentRow.editions.length > 0
    ) {
      rows.push(currentRow);
      currentRow = { editions: [], totalWidth: 0 };
    }
    currentRow.editions.push(oe);
    currentRow.totalWidth += thickness;
  }
  rows.push(currentRow);
  // Add empty rows if needed
  while (rows.length < MIN_ROWS) rows.push({ editions: [], totalWidth: 0 });

  //===== SVG canvas dimensions derived from row count =====
  const ROW_COUNT = rows.length;
  const INNER_HEIGHT =
    ROW_COUNT * (HEIGHT_OF_SHELF_ROW + SHELF_PLANK_THICKNESS);
  const TOTAL_WIDTH = WIDTH_OF_SHELF;
  const TOTAL_HEIGHT = INNER_HEIGHT + FRAME_BORDER * 2 + SHELF_PLANK_THICKNESS;

  // Renders the wooden frame, dark interior background, and shelf planks between rows.
  // Uses an SVG <pattern> for repeating wood grain lines on planks.
  const drawShelfStructure = (): ReactNode[] => {
    const elements: ReactNode[] = [];

    elements.push(
      <defs key="defs">
        {/* Repeating horizontal grain lines tiled across each plank */}
        <pattern
          id="woodGrain"
          patternUnits="userSpaceOnUse"
          width={LIFE_TO_RENDER_SCALE * 4}
          height={SHELF_PLANK_THICKNESS}
        >
          <rect
            width={LIFE_TO_RENDER_SCALE * 4}
            height={SHELF_PLANK_THICKNESS}
            fill={WOOD_MID}
          />
          <line
            x1="0"
            y1={SHELF_PLANK_THICKNESS * 0.35}
            x2={LIFE_TO_RENDER_SCALE * 4}
            y2={SHELF_PLANK_THICKNESS * 0.35}
            stroke={WOOD_GRAIN}
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line
            x1="0"
            y1={SHELF_PLANK_THICKNESS * 0.7}
            x2={LIFE_TO_RENDER_SCALE * 4}
            y2={SHELF_PLANK_THICKNESS * 0.7}
            stroke={WOOD_GRAIN}
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        </pattern>
        {/* Soft lateral shadow to visually separate adjacent books */}
        <filter id="bookShadow" x="-10%" y="-5%" width="130%" height="115%">
          <feDropShadow
            dx="2"
            dy="0"
            stdDeviation="2"
            floodColor="#000"
            floodOpacity="0.4"
          />
        </filter>
      </defs>,
    );

    // Outer frame + dark interior
    elements.push(
      <rect
        key="frame-bg"
        x={0}
        y={0}
        width={TOTAL_WIDTH}
        height={TOTAL_HEIGHT}
        fill={WOOD_FRAME}
        rx={4}
        ry={4}
      />,
      <rect
        key="interior-bg"
        x={FRAME_BORDER}
        y={FRAME_BORDER}
        width={INNER_WIDTH}
        height={INNER_HEIGHT + SHELF_PLANK_THICKNESS}
        fill={WOOD_DARK}
      />,
      // Thin light strip along the top edge to simulate a beveled frame
      <rect
        key="frame-top-highlight"
        x={0}
        y={0}
        width={TOTAL_WIDTH}
        height={FRAME_BORDER * 0.4}
        fill={WOOD_LIGHT}
        rx={4}
        ry={4}
      />,
    );

    // One plank per row, rendered below it (books sit on top of planks)
    for (let r = 0; r < ROW_COUNT; r++) {
      const plankY =
        FRAME_BORDER +
        (r + 1) * HEIGHT_OF_SHELF_ROW +
        r * SHELF_PLANK_THICKNESS;
      elements.push(
        <rect
          key={`plank-${r}`}
          x={FRAME_BORDER}
          y={plankY}
          width={INNER_WIDTH}
          height={SHELF_PLANK_THICKNESS}
          fill="url(#woodGrain)"
        />,
        // Light strip on top of plank for a 3-D raised edge feel
        <rect
          key={`plank-top-${r}`}
          x={FRAME_BORDER}
          y={plankY}
          width={INNER_WIDTH}
          height={SHELF_PLANK_THICKNESS * 0.25}
          fill={WOOD_LIGHT}
          opacity={0.5}
        />,
        // Dark strip at bottom of plank for shadow/depth
        <rect
          key={`plank-shadow-${r}`}
          x={FRAME_BORDER}
          y={plankY + SHELF_PLANK_THICKNESS * 0.75}
          width={INNER_WIDTH}
          height={SHELF_PLANK_THICKNESS * 0.25}
          fill={WOOD_DARK}
          opacity={0.4}
        />,
      );
    }

    return elements;
  };

  // Renders each book as a colored spine rect with optional title and volume number.
  // Book color is derived deterministically from series + title so it's stable across renders.
  // Text is suppressed on very thin spines to avoid overflow.
  const drawBooks = (): ReactNode[] => {
    const books: ReactNode[] = [];

    rows.forEach((row, rowIndex) => {
      // rowY = top of this row's book area; plankY = the shelf surface books rest on
      const rowY =
        FRAME_BORDER + rowIndex * (HEIGHT_OF_SHELF_ROW + SHELF_PLANK_THICKNESS);
      const plankY = rowY + HEIGHT_OF_SHELF_ROW;
      let xoffset = FRAME_BORDER;

      row.editions.forEach((oe, bookIndex) => {
        const thickness =
          oe.edition.dimensions.thickness * LIFE_TO_RENDER_SCALE;
        const height = oe.edition.dimensions.height * LIFE_TO_RENDER_SCALE;
        const bookY = plankY - height; // books are bottom-aligned to the plank

        // Deterministic hue: sum of char codes mod 360 gives a consistent color per title
        const colorSeed =
          (oe.edition.serie?.name ?? "") + (oe.edition.book?.name ?? "");
        const hue =
          [...colorSeed].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
        const bookColor = `hsl(${hue}, 55%, 38%)`;
        const bookColorLight = `hsl(${hue}, 55%, 52%)`;
        const bookColorDark = `hsl(${hue}, 55%, 22%)`;

        books.push(
          <g
            key={`book-${rowIndex}-${bookIndex}`}
            filter="url(#bookShadow)"
            onClick={() => onClick?.(oe)}
          >
            {/* Spine body */}
            <rect
              x={xoffset}
              y={bookY}
              width={thickness}
              height={height}
              fill={bookColor}
              stroke={bookColorDark}
              strokeWidth={1}
              className="cursor-pointer"
            />
            {/* Left-edge highlight to simulate spine curvature */}
            <rect
              x={xoffset}
              y={bookY}
              width={Math.min(3, thickness * 0.12)}
              height={height}
              fill={bookColorLight}
              opacity={0.6}
            />
            {/* Top edge highlight */}
            <rect
              x={xoffset}
              y={bookY}
              width={thickness}
              height={Math.min(4, height * 0.02)}
              fill={bookColorLight}
              opacity={0.8}
            />
            {/* Vertical title, hidden on spines narrower than 10px */}
            {thickness >= 10 && (
              <text
                x={xoffset + thickness / 2}
                y={bookY + TEXT_TOP_PADDING}
                writingMode="tb"
                fill="#fff"
                fontSize="11px"
                fontWeight="800"
                fontFamily="Georgia, serif"
                opacity={0.9}
                dominantBaseline="middle"
                textAnchor="start"
              >
                {oe.edition.book?.name}
              </text>
            )}
            {/* Volume number at spine bottom, hidden on spines narrower than 10px */}
            {thickness >= 10 && (
              <text
                x={xoffset + thickness / 2}
                y={plankY - TEXT_BOTTOM_PADDING}
                fill="#fff"
                fontSize="10px"
                fontWeight="bold"
                fontFamily="Georgia, serif"
                opacity={0.85}
                dominantBaseline="alphabetic"
                textAnchor="middle"
              >
                {oe.edition.book?.number}
              </text>
            )}
          </g>,
        );

        xoffset += thickness;
      });
    });

    return books;
  };

  return (
    // Scrollable container, the SVG height grows with row count, native scroll handles overflow
    <div
      className={twMerge(
        "w-full overflow-y-auto border border-neutral-800 rounded-lg",
        className,
      )}
    >
      {sortable && (
        <div className="flex py-2 px-1 gap-2 items-center">
          <SelectInput
            options={[
              {
                label: t("stash.bookshelf.sortBySerie"),
                value: "sortBySerie",
              },
              {
                label: t("stash.bookshelf.sortByHeight"),
                value: "sortByHeight",
              },
              {
                label: t("stash.bookshelf.sortByThickness"),
                value: "sortByThickness",
              },
            ]}
            defaultValue="sortBySerie"
            onValueChange={(value) => {
              const key = value as keyof typeof sortingAlgorithmsRegistry;
              setSortingAlgorithm(() => sortingAlgorithmsRegistry[key]);
            }}
          />
          {ascSort && (
            <TbSortAscendingLetters
              className="p-1 cursor-pointer rounded duration-150 hover:bg-neutral-600/40 active:scale-95"
              size={30}
              onClick={() => setAscSort(false)}
            />
          )}
          {!ascSort && (
            <TbSortDescendingLetters
              className="p-1 cursor-pointer rounded duration-150 hover:bg-neutral-600/40 active:scale-95"
              size={30}
              onClick={() => setAscSort(true)}
            />
          )}
        </div>
      )}
      <svg
        width={TOTAL_WIDTH}
        height={TOTAL_HEIGHT}
        viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        {drawShelfStructure()}
        {drawBooks()}
      </svg>
    </div>
  );
}
