"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/global/EmptyState"

interface DataTableProps<TData extends { id: string | number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableRowSelection?: boolean
  enablePagination?: boolean
  enableToolbar?: boolean
  onRowSelectionChange?: (selected: string[]) => void
  selectedRows?: string[]
  onEdit?: (row: TData) => void
  onClearSelection?: () => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
}

export function DataTable<TData extends { id: string | number }, TValue>({
  columns,
  data,
  enableRowSelection = true,
  enablePagination = true,
  enableToolbar = true,
  onRowSelectionChange,
  selectedRows = [],
  onEdit,
  onClearSelection,
  currentPage = 1,
  pageCount = 1,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Convert selected row IDs to row selection state
  React.useEffect(() => {
    if (selectedRows && selectedRows.length > 0) {
      const selectedState = selectedRows.reduce((acc, id) => ({
        ...acc,
        [id]: true
      }), {} as Record<string, boolean>);
      setRowSelection(selectedState);
    } else {
      setRowSelection({});
    }
  }, [selectedRows]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      pagination: { pageIndex: currentPage - 1, pageSize: 10 },
    },
    pageCount,
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({ pageIndex: currentPage - 1, pageSize: 10 });
        if (onPageChange) {
          onPageChange(newPagination.pageIndex + 1);
        }
      }
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);
      if (onRowSelectionChange) {
        onRowSelectionChange(Object.keys(newRowSelection).filter(key => newRowSelection[key]));
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: process.env.NODE_ENV === 'development',
  });

  // Add pagination controls if enabled
  const PaginationControls = () => (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= pageCount}
      >
        Next
      </Button>
    </div>
  );

  return (
    <Card>
      {enableToolbar && (
        <CardHeader className="px-6 py-4">
          <CardTitle>Categories</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Get started by adding a new category."
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {enablePagination && (
              <div className="flex items-center justify-end space-x-2">
                <div className="text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
