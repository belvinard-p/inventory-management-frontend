"use client"

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col items-stretch gap-2 w-full">
      <div className="text-sm text-muted-foreground text-center w-full whitespace-nowrap">
        Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()} ({table.getFilteredRowModel().rows.length} entreprises)
      </div>
      <nav
        role="navigation"
        aria-label="pagination"
        className="flex justify-center w-full"
      >
        <div className="flex flex-row items-center gap-1 flex-nowrap">
          <Button
            variant="outline"
            className="h-9 px-4 py-2 gap-1 pl-2.5"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          {[...Array(table.getPageCount()).keys()].map((page) => (
            <Button
              key={page}
              aria-current={table.getState().pagination.pageIndex === page ? "page" : undefined}
              className={`h-9 px-4 py-2 gap-2 ${table.getState().pagination.pageIndex === page ? 'bg-background border shadow-xs' : ''}`}
              onClick={() => table.setPageIndex(page)}
            >
              {page + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-9 px-4 py-2 gap-1 pr-2.5"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </div>
  )
}