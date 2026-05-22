import { useMemo, useState, type ReactNode } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useTranslation } from "~/i18n/i18n";
import { type Error } from "~/utils/error";
import { capitalize } from "~/utils/strings";
import { ToggleButton } from "../buttons/ToggleButton";
import { GenericButton } from "../buttons/GenericButton";

interface TableControlsProps {
  searchableKeys: string[];
  searchableKeysDisplay: string[];
  activeKeys: string[];
  onToggleKey: (arg0: string, arg1: boolean) => void;
  searchValue: string;
  onSearchChange: (arg0: string) => void;
}
function TableControls({
  searchableKeys,
  searchableKeysDisplay,
  activeKeys,
  onToggleKey,
  searchValue,
  onSearchChange,
}: TableControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-3 flex flex-wrap justify-between items-center gap-3 border-b border-white/8">
      {/* Filter toggles */}
      <div className="flex flex-wrap gap-1.5">
        {searchableKeys.map((key: string, index: number) => (
          <ToggleButton
            key={key}
            selected={activeKeys.includes(key)}
            onClick={() => onToggleKey(key, !activeKeys.includes(key))}
            className={`px-3 h-7 text-xs rounded-md border transition-all
              ${
                activeKeys.includes(key)
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:border-white/20"
              }`}
          >
            {searchableKeysDisplay[index] ?? capitalize(key)}
          </ToggleButton>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <MdOutlineSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
        />
        <input
          id="search"
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("generic.search.placeholder")}
          className="bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-sm text-white/70 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-48 md:w-64"
        />
      </div>
    </div>
  );
}

export interface ColumnDef<T> {
  key?: string;
  header?: string;
  searchable?: boolean;
  cellRenderer?: (arg: T) => ReactNode;
  getValue?: (arg: T) => string;
}

interface GenericTableProps<T> {
  list: T[] | null | undefined;
  columns: ColumnDef<T>[];
  addActions?: boolean;
  actionGenerator?: (arg: T) => ReactNode;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  error?: Error;
  className?: string;
  itemsPerPage?: number;
}

export function GenericTable<T extends Record<string, any>>(
  props: GenericTableProps<T>,
) {
  const { t } = useTranslation();
  const {
    list = [],
    columns,
    addActions,
    actionGenerator,
    onPageChange,
    isLoading,
    itemsPerPage = 10,
  } = props;

  const [currentPage, setCurrentPage] = useState(0);
  const handleNextPage = () => {
    setCurrentPage((p) => p + 1);
    onPageChange?.(currentPage);
  };
  const handlePreviousPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
    onPageChange?.(currentPage);
  };

  const tableCols = useMemo(() => {
    const cols = [...columns];
    if (addActions && actionGenerator) {
      cols.push({
        header: t("generic.actions", { capitalize: true }),
        cellRenderer: (val: T) => actionGenerator(val),
      });
    }
    return cols;
  }, [columns, addActions, actionGenerator]);

  const searchableKeys = useMemo(
    () =>
      columns
        .filter((col) => col.searchable && col.key)
        .map((col) => col.key as string),
    [columns],
  );

  const [activeSearchKeys, setActiveSearchKeys] =
    useState<string[]>(searchableKeys);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleKey = (key: string, isSelected: boolean) => {
    setActiveSearchKeys((prev) =>
      isSelected ? [...prev, key] : prev.filter((k) => k !== key),
    );
  };

  const filteredList = useMemo(() => {
    if (!list) return [];
    if (!searchQuery) return list;
    const lowerQuery = searchQuery.toLowerCase();
    return list.filter((item) =>
      activeSearchKeys.some((key) => {
        const valFunc = columns.find((col) => col.key === key)?.getValue;
        const value = valFunc ? valFunc(item) : "";
        return value.toLowerCase().includes(lowerQuery);
      }),
    );
  }, [list, searchQuery, activeSearchKeys]);

  const paginatedList = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const handleSearch = (value: string) => {
    setCurrentPage(0);
    setSearchQuery(value);
  };

  if (isLoading) {
    return (
      <div
        className={`border border-white/8 rounded-lg overflow-hidden ${props.className}`}
      >
        {/* Skeleton header */}
        <div className="px-4 py-3 border-b border-white/8 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded-md bg-white/5 animate-pulse"
            />
          ))}
        </div>
        {/* Skeleton rows */}
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-white/5">
            {Array.from({ length: columns.length }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded bg-white/5 animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`border border-white/8 rounded-lg overflow-hidden ${props.className}`}
    >
      {/* Controls */}
      {searchableKeys.length > 0 && (
        <TableControls
          searchableKeys={searchableKeys}
          searchableKeysDisplay={searchableKeys.map(
            (key) => columns.find((col) => col.key === key)?.header ?? key,
          )}
          activeKeys={activeSearchKeys}
          onToggleKey={handleToggleKey}
          searchValue={searchQuery}
          onSearchChange={handleSearch}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-white/8">
              {tableCols.map((col, idx) => (
                <th
                  key={col.header ?? idx}
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-white/30"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedList.length > 0 ? (
              paginatedList.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className="border-b border-white/5 last:border-none hover:bg-white/3 transition-colors group"
                >
                  {tableCols.map((col, colIdx) => (
                    <td
                      key={`${rowIdx}-${colIdx}`}
                      className="px-4 py-3 text-sm text-white/60 group-hover:text-white/80 transition-colors"
                    >
                      {col.cellRenderer
                        ? col.cellRenderer(row)
                        : col.key
                          ? row[col.key]
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableCols.length}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-sm text-white/25 italic">
                    {props.emptyMessage ?? t("loader.nodata")}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredList.length > 0 && (
        <div className="px-4 py-3 flex justify-between items-center border-t border-white/8">
          <span className="text-xs text-white/25 tabular-nums">
            {t("generic.pagination", {
              parameters: {
                items: t("generic.items", { capitalize: true }),
                current: currentPage + 1,
                total: totalPages,
                from: currentPage * itemsPerPage + 1,
                to: Math.min(
                  (currentPage + 1) * itemsPerPage,
                  filteredList.length,
                ),
                count: filteredList.length,
              },
            })}
          </span>
          <div className="flex gap-1.5">
            <GenericButton
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-all"
            >
              <BsArrowLeft size={14} />
            </GenericButton>
            <GenericButton
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed px-3 py-1.5 rounded-md transition-all"
            >
              <BsArrowRight size={14} />
            </GenericButton>
          </div>
        </div>
      )}
    </div>
  );
}
