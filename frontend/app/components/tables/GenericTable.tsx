import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Fragment, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../shadcn/ui/select";

// Re-export ColumnDef so callers import from one place
export type { ColumnDef };

export type FilterType = "none" | "text" | "boolean" | "multi";

interface GenericTableProps<T> {
  list?: T[];
  columns: ColumnDef<T, any>[];
  isLoading?: boolean;
  emptyMessage?: string;
  error?: Error;
  className?: string;
  itemsPerPage?: number;
}

export function GenericTable<T extends Record<string, any>>({
  list,
  columns,
  isLoading,
  emptyMessage,
  error,
  className,
  itemsPerPage = 10,
}: GenericTableProps<T>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: list ?? [],
    columns,
    state: { sorting },
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
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: itemsPerPage } },
  });

  if (isLoading) {
    return (
      <div
        className={`border border-white/8 rounded-lg overflow-hidden ${className}`}
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

  return (
    <div
      className={`border border-white/8 rounded-lg overflow-hidden ${className}`}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <Fragment key={headerGroup.id}>
                {/* Filters row (inputs above headers) */}
                <TableRow
                  key={`${headerGroup.id}-filters`}
                  className="border-white/8"
                >
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | {
                          filterType?: "text" | "boolean" | "single";
                          options?: string[];
                          placeholder?: string;
                        }
                      | undefined;

                    const filterValue = header.column.getFilterValue();

                    const renderFilter = () => {
                      if (!meta?.filterType) {
                        return (
                          <Input
                            value={(filterValue as string) ?? ""}
                            onChange={(e) => {
                              table.setPageIndex(0);
                              header.column.setFilterValue(e.target.value);
                            }}
                            placeholder={t("generic.search.placeholder")}
                            className="h-8 text-sm bg-white/5 border-white/10 text-white/70 placeholder:text-white/20"
                          />
                        );
                      }

                      switch (meta.filterType) {
                        case "boolean":
                          return (
                            <SelectInput
                              options={[
                                {
                                  label: t("generic.yes", { capitalize: true }),
                                  value: "true",
                                },
                                {
                                  label: t("generic.no", { capitalize: true }),
                                  value: "false",
                                },
                              ]}
                              filterValue={(filterValue as string) ?? ""}
                              selectAll
                              onValueChange={(value) => {
                                table.setPageIndex(0);
                                header.column.setFilterValue(
                                  value === "any" ? undefined : value,
                                );
                              }}
                              placeholder={meta.placeholder}
                            />
                          );

                        case "single":
                          return (
                            <SelectInput
                              options={
                                meta.options?.map((o: string) => {
                                  return { label: o, value: o };
                                }) || []
                              }
                              filterValue={(filterValue as string) ?? ""}
                              selectAll
                              onValueChange={(value) => {
                                table.setPageIndex(0);
                                header.column.setFilterValue(
                                  value === "any" ? undefined : value,
                                );
                              }}
                              placeholder={meta.placeholder}
                            />
                          );

                        default:
                          return (
                            <Input
                              value={(filterValue as string) ?? ""}
                              onChange={(e) => {
                                table.setPageIndex(0);
                                header.column.setFilterValue(e.target.value);
                              }}
                              placeholder={
                                meta.placeholder ||
                                t("generic.search.placeholder")
                              }
                              className="h-8 text-sm bg-white/5 border-white/10 text-white/70 placeholder:text-white/20"
                            />
                          );
                      }
                    };

                    return (
                      <TableHead
                        key={`${header.id}-filter`}
                        className="h-10 py-2"
                      >
                        {header.column.getCanFilter() ? renderFilter() : null}
                      </TableHead>
                    );
                  })}
                </TableRow>
                {/* Header labels row */}
                <TableRow
                  key={headerGroup.id}
                  className="border-white/8 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-medium uppercase tracking-widest text-white/30 h-10"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="max-w-40 text-wrap">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                        {/* Sorting arrows */}
                        {header.column.getCanSort() && (
                          <ArrowUpDown
                            size={16}
                            className="cursor-pointer rounded p-0.5 hover:bg-white/10 hover:scale-105 active:scale-95 flex-shrink-0"
                            onClick={() =>
                              header.column.toggleSorting(
                                header.column.getIsSorted() === "asc",
                              )
                            }
                          />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/5 hover:bg-white/3 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="max-w-50 text-sm text-white/60 group-hover:text-white/80 transition-colors py-3 truncate"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-white/25 italic"
                >
                  {emptyMessage ?? t("loader.nodata")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="px-4 py-3 flex justify-between items-center border-t border-white/8">
          <span className="text-xs text-white/25 tabular-nums">
            {t("generic.pagination", {
              parameters: {
                items: t("generic.items", { capitalize: true }),
                current: table.getState().pagination.pageIndex + 1,
                total: table.getPageCount(),
                from: table.getState().pagination.pageIndex * itemsPerPage + 1,
                to: Math.min(
                  (table.getState().pagination.pageIndex + 1) * itemsPerPage,
                  table.getFilteredRowModel().rows.length,
                ),
                count: table.getFilteredRowModel().rows.length,
              },
            })}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 h-8 w-8 p-0"
            >
              <BsArrowLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 h-8 w-8 p-0"
            >
              <BsArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectInputProps {
  options: {
    label: string;
    value: string;
  }[];
  filterValue: string;
  placeholder?: string;
  selectAll?: boolean;
  onValueChange: (val: string) => void;
}

function SelectInput({
  options,
  filterValue,
  placeholder,
  selectAll,
  onValueChange,
}: SelectInputProps) {
  const { t } = useTranslation();
  return (
    <Select value={filterValue} onValueChange={onValueChange}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue
          placeholder={placeholder || t("generic.search.placeholder")}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            {placeholder || t("generic.search.placeholder")}
          </SelectLabel>
          {selectAll && (
            <SelectItem value="any">
              {t("generic.all", {
                capitalize: true,
              })}
            </SelectItem>
          )}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
