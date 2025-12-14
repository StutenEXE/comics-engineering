import type { Error } from "~/utils/error"
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_Cell,
} from 'material-react-table';
import { deepCopy } from "~/utils/object";
import type { ReactNode } from "react";


// MRT_RowData is an alias for Record<string, any>
interface GenericTableProps<T extends MRT_RowData> {
    list: T[] | null | undefined
    columns: MRT_ColumnDef<T>[]
    addActions?: boolean
    actionGenerator?: (arg: T) => ReactNode
    isLoading?: boolean
    emptyMessage?: string
    error?: Error
    className?: string
}

export function GenericTable<T extends MRT_RowData>(props: GenericTableProps<T>) {

    // Duplicate to avoid loop issues
    let tableCols = [...props.columns]
    if (props.addActions) {
        tableCols.push({
            header: 'Actions',
            size: 50,
            Cell: (cell) => {
                if (!props.actionGenerator) {
                    return 
                }
                return props.actionGenerator(cell.row.original as T)
            }
        })
    }

    const table = useMaterialReactTable({
        columns: tableCols,
        data: props.list ?? [],
          muiTableBodyCellProps: {
            sx: {
                backgroundColor: '#ff0000',
            }
        },
    })

    return (
        <MaterialReactTable table={table} />
    )

}