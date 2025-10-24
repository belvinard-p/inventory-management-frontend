"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  totalItems?: number
  isLoading?: boolean
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
  onPageSizeChange,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  pageCount: controlledPageCount,
  totalItems,
  isLoading = false,
}: DataTablePaginationProps<TData>) {
  const isControlled = controlledPageIndex !== undefined && controlledPageSize !== undefined
  const pageIndex = isControlled ? controlledPageIndex : table.getState().pagination.pageIndex
  const pageSize = isControlled ? controlledPageSize : table.getState().pagination.pageSize
  const pageCount = controlledPageCount || table.getPageCount()
  
  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < pageCount - 1
  
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5 // Maximum number of page buttons to show
    
    if (pageCount <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 0; i < pageCount; i++) {
        pages.push(i + 1)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate start and end of the middle section
      let start = Math.max(2, pageIndex - 1)
      let end = Math.min(pageCount - 1, pageIndex + 1)
      
      // Adjust if we're near the start or end
      if (pageIndex <= 3) {
        end = 4
      } else if (pageIndex >= pageCount - 3) {
        start = pageCount - 3
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < pageCount) {
          pages.push(i)
        }
      }
      
      // Add ellipsis if needed
      if (end < pageCount - 1) {
        pages.push('...')
      }
      
      // Always show last page
      if (pageCount > 1) {
        pages.push(pageCount)
      }
    }
    
    return pages
  }

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page - 1) // Convert to 0-based index
    } else {
      table.setPageIndex(page - 1)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between px-2 space-y-2 lg:space-y-0 lg:space-x-6">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} sur{" "}
        {typeof totalItems === 'number' ? totalItems : table.getFilteredRowModel().rows.length} ligne(s) au total.
      </div>
      
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden sm:block">Lignes par page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value)
              if (onPageSizeChange) {
                onPageSizeChange(newPageSize)
              } else {
                table.setPageSize(newPageSize)
              }
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-1">
          <Pagination className="m-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  className={!canPreviousPage || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!canPreviousPage || isLoading) return
                    if (onPageChange) {
                      onPageChange(pageIndex - 1)
                    } else {
                      table.previousPage()
                    }
                  }}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, i) => {
                if (page === '...') {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                
                const pageNum = Number(page)
                const isCurrent = pageNum === pageIndex + 1
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={isCurrent}
                      className={isCurrent ? "bg-primary text-primary-foreground" : "cursor-pointer"}
                      onClick={(e) => {
                        e.preventDefault()
                        if (isLoading) return
                        handlePageChange(pageNum)
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              <PaginationItem>
                <PaginationNext 
                  className={!canNextPage || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!canNextPage || isLoading) return
                    if (onPageChange) {
                      onPageChange(pageIndex + 1)
                    } else {
                      table.nextPage()
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}