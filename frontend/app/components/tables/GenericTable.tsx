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
    <div className="p-4 flex flex-wrap justify-between items-center gap-4 bg-gray-900 rounded-t-lg">
      <div className="flex flex-wrap gap-2">
        {searchableKeys.map((key: string, index: number) => (
          <ToggleButton
            key={key}
            selected={activeKeys.includes(key)}
            onClick={() => onToggleKey(key, !activeKeys.includes(key))}
            className="px-3 h-9 text-sm"
          >
            {searchableKeysDisplay[index] ?? capitalize(key)}
          </ToggleButton>
        ))}
      </div>
      <div
        className="flex items-center gap-2 bg-gray-900 border border-gray-600 px-3 py-1 
            rounded-md focus:border-white-500 transition-colors"
      >
        <label htmlFor="search">
          <MdOutlineSearch size={20} className="text-gray-400" />
        </label>
        <input
          id="search"
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("generic.search.placeholder")}
          className="bg-transparent border-none outline-none text-sm text-white w-48 md:w-64"
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
    isLoading,
    itemsPerPage = 10,
  } = props;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  // Prepare Columns (memoized to prevent unnecessary re-calculation)
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

  // Search State
  const searchableKeys = useMemo(
    () =>
      columns
        .filter((col) => col.searchable && col.key)
        .map((col) => col.key as string),
    [columns],
  );

  // Search keys
  const [activeSearchKeys, setActiveSearchKeys] =
    useState<string[]>(searchableKeys);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleKey = (key: string, isSelected: boolean) => {
    setActiveSearchKeys((prev) =>
      isSelected ? [...prev, key] : prev.filter((k) => k !== key),
    );
  };

  // Filtered Data (calculated on render, memoized for performance)
  const filteredList = useMemo(() => {
    if (!list) return [];
    if (!searchQuery) return list;

    const lowerQuery = searchQuery.toLowerCase();
    return list.filter((item) => {
      return activeSearchKeys.some((key) => {
        const valFunc = columns.find((col) => col.key === key)?.getValue;
        const value = valFunc ? valFunc(item) : "";
        return value.toLowerCase().includes(lowerQuery);
      });
    });
  }, [list, searchQuery, activeSearchKeys]);

  // Paginated Data
  const paginatedList = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredList.slice(startIndex, endIndex);
  }, [filteredList, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // Reset to first page when search query changes
  const handleSearch = (value: string) => {
    setCurrentPage(0);
    setSearchQuery(value);
  };

  // Loading & Empty States
  if (isLoading)
    return <div className="p-8 text-center">{t("loader.loading")}</div>;

  return (
    <div
      className={`overflow-x border border-gray-700 rounded-lg ${props.className}`}
    >
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

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-300">
              {tableCols.map((col, idx) => (
                <th
                  key={col.header ?? idx}
                  className="p-3 text-left font-semibold border-b border-gray-700"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedList.length > 0 ? (
              paginatedList.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  {tableCols.map((col, colIdx) => (
                    <td key={`${rowIdx}-${colIdx}`} className="p-3 text-sm">
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
                  className="p-8 text-center text-gray-500"
                >
                  {props.emptyMessage ?? t("loader.nodata")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredList.length > 0 && (
        <div className="p-4 flex justify-between items-center bg-gray-900 rounded-b-lg border-t border-gray-700">
          <span className="text-sm text-gray-400">
            {t("generic.pagination", {
              parameters: {
                items: t('generic.items', { capitalize: true }),
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
          <div className="flex gap-2">
            <GenericButton
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-3 h-9 text-sm"
            >
              <BsArrowLeft size={16} />
            </GenericButton>
            <GenericButton
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="px-3 h-9 text-sm"
            >
              <BsArrowRight size={16} />
            </GenericButton>
          </div>
        </div>
      )}
    </div>
  );
}
