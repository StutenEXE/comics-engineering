import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/shadcn/ui/button";
import { Input } from "~/components/shadcn/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/shadcn/ui/table";
import { useTranslation } from "~/i18n/i18n";
import { type Error } from "~/utils/error";
import { SelectInput } from "../forms/fields/SelectInput";
import type { ServerTableControl } from "./useServerTable";

// Re-export ColumnDef so callers import from one place
export type { ColumnDef };

export type FilterType = "none" | "text" | "boolean" | "single" | "numrange";

// Option of a "single" filter, a string is used as both label and value
export type FilterOption = string | { label: string; value: string };

interface GenericTableProps<T> {
  list?: T[];
  columns: ColumnDef<T, any>[];
  // Shows a skeleton instead of the table
  isLoading?: boolean;
  // Dims the rows while a new page is being fetched
  isFetching?: boolean;
  emptyMessage?: string;
  error?: Error;
  className?: string;
  itemsPerPage?: number;
  // When set, pagination, sorting and filtering are done by the API (see useServerTable) :
  // `list` is the current page and `rowCount` the total number of rows
  server?: ServerTableControl & { rowCount: number };
  // When set, rows are shown as cards under the lg breakpoint (phones and tablets),
  // filters and sorting move to a toolbar above them
  renderCard?: (row: T) => ReactNode;
}

export function GenericTable<T extends Record<string, any>>({
  list,
  columns,
  isLoading,
  isFetching,
  emptyMessage,
  error,
  className,
  itemsPerPage = 10,
  server,
  renderCard,
}: GenericTableProps<T>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: itemsPerPage,
  });
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const table = useReactTable({
    data: list ?? [],
    columns,
    ...(server
      ? {
          state: server.state,
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          rowCount: server.rowCount,
          onPaginationChange: server.onPaginationChange,
          onSortingChange: server.onSortingChange,
          onColumnFiltersChange: server.onColumnFiltersChange,
        }
      : {
          state: { sorting, pagination },
          onSortingChange: setSorting,
          onPaginationChange: setPagination,
        }),
    // Custom filter functions available to columns via `filterFn`
    filterFns: {
      arrIncludes: (row, columnId, filterValue: unknown) => {
        if (!filterValue) return true;
        const arr = Array.isArray(filterValue) ? filterValue : [filterValue];
        const cell = row.getValue(columnId);
        return arr.length === 0 ? true : arr.includes(cell as any);
      },
      equals: (row, columnId, filterValue: unknown) => {
        if (
          filterValue === undefined ||
          filterValue === null ||
          filterValue === ""
        )
          return true;
        const cell = row.getValue(columnId);
        return String(cell) === String(filterValue);
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Total number of rows (all pages) and size of a page
  const rowCount = server
    ? server.rowCount
    : table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  // Filterable and sortable columns, for the card view's toolbar
  const leafColumns = table.getAllLeafColumns();
  const filterableColumns = leafColumns.filter((c) => c.getCanFilter());
  const sortableColumns = leafColumns.filter((c) => c.getCanSort());
  const activeFilterCount = table
    .getState()
    .columnFilters.filter((f) => !isEmptyFilterValue(f.value)).length;
  const currentSort = table.getState().sorting[0];

  if (isLoading) {
    return (
      <div
        className={twMerge(
          "border border-white/8 rounded-lg overflow-hidden",
          className,
        )}
      >
        <div className="px-4 py-3 border-b border-white/8 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded-md bg-white/5 animate-pulse"
            />
          ))}
        </div>
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-white/5">
            {Array.from({ length: columns.length }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded bg-white/5 animate-pulse flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const emptyState = (
    <p className="py-12 text-center text-sm text-white/25 italic">
      {emptyMessage ?? t("loader.nodata")}
    </p>
  );

  return (
    <div
      className={twMerge(
        "border border-white/8 rounded-lg overflow-hidden",
        className,
      )}
    >
      {/* Card view (phones and tablets) */}
      {renderCard && (
        <div className="lg:hidden">
          {/* Toolbar : sorting and filters */}
          {(sortableColumns.length > 0 || filterableColumns.length > 0) && (
            <div className="flex flex-col border-b border-white/8">
              <div className="flex items-center gap-2 px-3 py-2">
                {sortableColumns.length > 0 && (
                  <>
                    <SelectInput
                      placeholder={t("generic.sortBy")}
                      value={currentSort?.id ?? ""}
                      options={sortableColumns.map((c) => ({
                        label: columnLabel(c),
                        value: c.id,
                      }))}
                      onValueChange={(id) =>
                        table.setSorting([
                          { id, desc: currentSort?.desc ?? false },
                        ])
                      }
                    />
                    <button
                      type="button"
                      disabled={!currentSort}
                      onClick={() =>
                        currentSort &&
                        table.setSorting([
                          { id: currentSort.id, desc: !currentSort.desc },
                        ])
                      }
                      aria-label={t(
                        currentSort?.desc
                          ? "generic.sort.desc"
                          : "generic.sort.asc",
                      )}
                      className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {currentSort?.desc ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )}
                    </button>
                  </>
                )}
                {filterableColumns.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                    aria-expanded={areFiltersOpen}
                    className={twMerge(
                      "ml-auto flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                      areFiltersOpen || activeFilterCount > 0
                        ? "border-stash-400/30 bg-stash-400/10 text-stash-200"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <SlidersHorizontal size={14} />
                    {t("generic.filters")}
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-stash-400/20 px-1.5 text-xs tabular-nums">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
              {areFiltersOpen && (
                <div className="grid gap-3 border-t border-white/8 bg-white/2 px-3 py-3 sm:grid-cols-2">
                  {filterableColumns.map((column) => (
                    <div key={column.id} className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                        {columnLabel(column)}
                      </span>
                      <ColumnFilter
                        column={column}
                        onChange={() => table.setPageIndex(0)}
                      />
                    </div>
                  ))}
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => table.resetColumnFilters()}
                      className="cursor-pointer justify-self-start text-sm text-stash-200/80 hover:text-stash-200 hover:underline sm:col-span-2"
                    >
                      {t("generic.filters.clear")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cards */}
          <ul
            className={`divide-y divide-white/5 transition-opacity ${isFetching ? "opacity-40" : ""}`}
          >
            {table.getRowModel().rows.map((row) => (
              <li key={row.id}>{renderCard(row.original)}</li>
            ))}
          </ul>
          {table.getRowModel().rows.length === 0 && emptyState}
        </div>
      )}

      {/* Table (every screen without a card view, large screens with one) */}
      <div
        className={twMerge("overflow-x-auto", renderCard && "hidden lg:block")}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <Fragment key={headerGroup.id}>
                {/* Filters row (inputs above headers) */}
                <TableRow
                  key={`${headerGroup.id}-filters`}
                  className="border-white/8"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={`${header.id}-filter`}
                      className="h-10 py-2"
                    >
                      {header.column.getCanFilter() ? (
                        <ColumnFilter
                          column={header.column}
                          onChange={() => table.setPageIndex(0)}
                        />
                      ) : null}
                    </TableHead>
                  ))}
                </TableRow>
                {/* Header labels row */}
                <TableRow
                  key={headerGroup.id}
                  className="border-white/8 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="w-fit max-w-50 text-xs font-medium uppercase tracking-widest text-white/40 h-10 border-r"
                    >
                      <div className="flex gap-2 justify-center items-center">
                        <div className="text-wrap text-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                        {/* Sorting arrows */}
                        {header.column.getCanSort() && (
                          <>
                            {/* Not sorted */}
                            {!header.column.getIsSorted() && (
                              <ArrowUpDown
                                size={16}
                                className="cursor-pointer rounded p-0.5 hover:bg-white/10 hover:scale-105 active:scale-95 flex-shrink-0"
                                onClick={() => header.column.toggleSorting()}
                              />
                            )}
                            {/* Sorted Asc */}
                            {header.column.getIsSorted() === "asc" && (
                              <ArrowDown
                                size={16}
                                className="cursor-pointer rounded p-0.5 hover:bg-white/10 hover:scale-105 active:scale-95 flex-shrink-0"
                                onClick={() => header.column.toggleSorting()}
                              />
                            )}
                            {/* Sorted Desc */}
                            {header.column.getIsSorted() === "desc" && (
                              <ArrowUp
                                size={16}
                                className="cursor-pointer rounded p-0.5 hover:bg-white/10 hover:scale-105 active:scale-95 flex-shrink-0"
                                onClick={() => header.column.toggleSorting()}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableHeader>
          <TableBody
            className={`transition-opacity ${isFetching ? "opacity-40" : ""}`}
          >
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/5 hover:bg-white/3 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="w-fit max-w-50 text-sm text-white/70 group-hover:text-white/80 transition-colors py-3"
                    >
                      <div className="w-full min-w-fit flex justify-center text-wrap text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>{emptyState}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {rowCount > 0 && (
        <div className="px-4 py-3 flex justify-between items-center gap-3 border-t border-white/8">
          <span className="text-xs text-white/25 tabular-nums">
            {t("generic.pagination", {
              parameters: {
                items: t("generic.items", { capitalize: true }),
                current: pageIndex + 1,
                total: table.getPageCount(),
                from: pageIndex * pageSize + 1,
                to: Math.min((pageIndex + 1) * pageSize, rowCount),
                count: rowCount,
              },
            })}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("generic.previousPage")}
              className="bg-white/5 border-white/10 text-white/50 cursor-pointer hover:bg-white/10 hover:text-white/80 disabled:opacity-20 h-9 w-9 lg:h-8 lg:w-8 p-0"
            >
              <BsArrowLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label={t("generic.nextPage")}
              className="bg-white/5 border-white/10 text-white/50 cursor-pointer hover:bg-white/10 hover:text-white/80 disabled:opacity-20 h-9 w-9 lg:h-8 lg:w-8 p-0"
            >
              <BsArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function isEmptyFilterValue(value: unknown) {
  if (Array.isArray(value)) return value.every((v) => v === "" || v == null);
  return value === undefined || value === null || value === "";
}

// Header of a column as plain text (headers given as functions fall back to the column id)
function columnLabel<T>(column: Column<T, unknown>) {
  const header = column.columnDef.header;
  return typeof header === "string" ? header : column.id;
}

interface ColumnFilterMeta {
  filterType?: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  placeholderMin?: string;
  placeholderMax?: string;
}

const filterInputClassName =
  "h-8 text-sm bg-white/5 border-white/10 text-white/70 placeholder:text-white/20";

// Filter input of a column, depends on its meta.filterType
function ColumnFilter<T>({
  column,
  onChange,
}: {
  column: Column<T, unknown>;
  // Ex : go back to the first page
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const meta = column.columnDef.meta as ColumnFilterMeta | undefined;
  const filterValue = column.getFilterValue();
  const setFilterValue = (value: unknown) => {
    onChange();
    column.setFilterValue(value);
  };

  switch (meta?.filterType) {
    case "boolean":
      return (
        <SelectInput
          options={[
            {
              label: t("generic.yes", { capitalize: true }),
              value: true,
            },
            {
              label: t("generic.no", { capitalize: true }),
              value: false,
            },
          ]}
          value={(filterValue as string) ?? ""}
          selectAll
          onValueChange={(value) =>
            setFilterValue(value === "any" ? undefined : value)
          }
          placeholder={meta.placeholder}
        />
      );

    case "single":
      return (
        <SelectInput
          options={
            meta.options?.map((o: FilterOption) =>
              typeof o === "string" ? { label: o, value: o } : o,
            ) || []
          }
          value={(filterValue as string) ?? ""}
          selectAll
          onValueChange={(value) =>
            setFilterValue(value === "any" ? undefined : value)
          }
          placeholder={meta.placeholder}
        />
      );

    case "numrange": {
      const [min, max] = (filterValue as string[]) ?? ["", ""];
      return (
        <div className="flex">
          <Input
            value={min}
            onChange={(e) => setFilterValue([e.target.value, max])}
            placeholder={
              meta.placeholderMin || t("generic.min", { capitalize: true })
            }
            pattern="[0-9]+" // Prevents the creation of the up/down arrows
            className={twMerge(filterInputClassName, "w-full lg:w-15")}
          />
          <Input
            value={max}
            onChange={(e) => setFilterValue([min, e.target.value])}
            placeholder={
              meta.placeholderMax || t("generic.max", { capitalize: true })
            }
            pattern="[0-9]+" // Prevents the creation of the up/down arrows
            className={twMerge(filterInputClassName, "w-full lg:w-15")}
          />
        </div>
      );
    }

    default:
      return (
        <Input
          value={(filterValue as string) ?? ""}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder={meta?.placeholder || t("generic.search.placeholder")}
          className={filterInputClassName}
        />
      );
  }
}

export function BooleanCellRenderer({ val }: { val: boolean }) {
  return (
    <>
      {val && <MdCheckBox size={20} className="text-green-500" />}
      {!val && <MdCheckBoxOutlineBlank size={20} className="text-grey-500" />}
    </>
  );
}
