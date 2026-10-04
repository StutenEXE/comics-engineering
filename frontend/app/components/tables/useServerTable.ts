import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import type { PageRequest, SortRequest } from "~/store/services/apiModels";

// Table state and handlers to give to GenericTable's `server` prop
export interface ServerTableControl {
  state: {
    pagination: PaginationState;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
  };
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
}

interface UseServerTableOptions {
  pageSize?: number;
  // Sorting applied on first render, column IDs must be API sort fields
  initialSorting?: SortingState;
  // Delay before a filter change triggers a request (avoids one request per keystroke)
  filterDebounceMs?: number;
}

/**
 * Holds the state of a table whose pagination, sorting and filtering are done
 * by the API. Column IDs are used as API sort fields and filter names.
 *
 * @returns
 *  - control : to give to GenericTable's `server` prop
 *  - request : pagination and sorting parameters of the API request
 *  - filters : debounced column filter values by column ID (empty values removed)
 */
export function useServerTable<SortField extends string = string>({
  pageSize = 10,
  initialSorting = [],
  filterDebounceMs = 300,
}: UseServerTableOptions = {}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Filters are only sent to the API once the user stopped typing
  const [debouncedFilters, setDebouncedFilters] = useState(columnFilters);
  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedFilters(columnFilters),
      filterDebounceMs,
    );
    return () => clearTimeout(timeout);
  }, [columnFilters]);

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const control: ServerTableControl = {
    state: { pagination, sorting, columnFilters },
    onPaginationChange: setPagination,
    // A new sorting or filter changes the content of every page, go back to the first one
    onSortingChange: (updater) => {
      setSorting(updater);
      resetPage();
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      resetPage();
    },
  };

  const sort = sorting[0];
  const request: PageRequest & SortRequest<SortField> = {
    offset: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
    // Column IDs of sortable columns are API sort fields
    sortField: sort?.id as SortField | undefined,
    sortDirection: sort ? (sort.desc ? "desc" : "asc") : undefined,
  };

  const filters: Record<string, string> = Object.fromEntries(
    debouncedFilters
      .filter((f) => f.value !== undefined && f.value !== null && f.value !== "")
      .map((f) => [f.id, String(f.value).trim()])
      .filter(([, value]) => value !== ""),
  );

  return { control, request, filters };
}
