"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { EmptyState } from "@/components/global/EmptyState"

import { DataTableToolbar } from "./DataTableToolbar"
import { DataTablePagination } from "./DataTablePagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableRowSelection?: boolean
  enablePagination?: boolean
  enableToolbar?: boolean
  onRowSelectionChange?: (selected: unknown) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = true,
  enablePagination = true,
  enableToolbar = true,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  // Protection contre les données undefined/null
  const safeData: TData[] = Array.isArray(data) ? data : []
  const safeColumns = Array.isArray(columns) ? columns : []
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isMobile, setIsMobile] = React.useState(false)

  // Détection mobile
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Gérer les changements de sélection
  const handleRowSelectionChange = React.useCallback((updater: React.SetStateAction<Record<string, boolean>>) => {
    setRowSelection(updater)
    if (onRowSelectionChange) {
      const newSelection = typeof updater === 'function' 
        ? updater(rowSelection) 
        : updater
      onRowSelectionChange(newSelection)
    }
  }, [onRowSelectionChange, rowSelection])

  const table = useReactTable({
    data: safeData,
    columns: safeColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Fonction utilitaire pour obtenir l'en-tête d'une colonne en français
  const getFrenchColumnHeader = (accessorKey: string) => {
    const frenchHeaders: { [key: string]: string } = {
      'username': 'Nom',
      'userName': 'Nom',
      'email': 'Email',
      'role': 'Rôle',
      'roleName': 'Rôle',
      'status': 'Statut',
      'createdAt': 'Date de création',
      'createdDate': 'Date de création',
      'actions': 'Actions'
    }
    
    return frenchHeaders[accessorKey] || accessorKey
  }

  // Version mobile avec cartes
  if (isMobile && safeData.length > 0) {
    return (
      <div className="space-y-4">
        {enableToolbar && <DataTableToolbar table={table} />}
        
        <div className="space-y-4">
          {table.getRowModel().rows.map((row) => {
            const statusColumn = safeColumns.find(col => (col as { accessorKey?: string }).accessorKey === 'status')
            const statusCell = statusColumn ? row.getVisibleCells().find(cell => (cell.column.columnDef as { accessorKey?: string }).accessorKey === 'status') : null
            
            return (
              <Card key={row.id} className={row.getIsSelected() ? "bg-muted/50 border-primary" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center text-base">
                    {/* Première colonne (généralement le nom) */}
                    <span>
                      {row.getVisibleCells()[0] ? (
                        flexRender(
                          row.getVisibleCells()[0].column.columnDef.cell,
                          row.getVisibleCells()[0].getContext()
                        )
                      ) : (
                        // Fallback si la cellule n'est pas disponible
                        String(row.getValue((safeColumns[0] as { accessorKey?: string }).accessorKey || '') || '')
                      )}
                    </span>
                    
                    {/* Badge pour le statut (si disponible) */}
                    {statusCell && (
                      <Badge variant="secondary">
                        {flexRender(
                          statusCell.column.columnDef.cell,
                          statusCell.getContext()
                        )}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {/* Toutes les colonnes sauf la première */}
                  {row.getVisibleCells().slice(1).map((cell) => {
                    const accessorKey = (cell.column.columnDef as { accessorKey?: string }).accessorKey
                    // On saute la colonne status car déjà affichée dans le header
                    if (accessorKey === 'status') return null

                    return (
                      <div key={cell.id} className="flex justify-between">
                        <span className="font-medium">
                          {accessorKey ? getFrenchColumnHeader(accessorKey) : 'Actions'}:
                        </span>
                        <span className="text-right">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {enablePagination && <DataTablePagination table={table} />}
      </div>
    )
  }

  // Version desktop avec tableau
  return (
    <div className="space-y-4">
      {enableToolbar && <DataTableToolbar table={table} />}
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const accessorKey = (header.column.columnDef as { accessorKey?: string }).accessorKey
                    const frenchHeader = getFrenchColumnHeader(accessorKey || '')
                    
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : accessorKey ? frenchHeader : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                        }
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
                    className={row.getIsSelected() ? "bg-muted/50" : ""}
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
                  <TableCell colSpan={safeColumns.length || 1} className="p-0">
                    <EmptyState 
                      title={safeData.length === 0 ? "Aucune donnée" : "Aucun résultat"}
                      description={safeData.length === 0 
                        ? "Aucun utilisateur n'a été trouvé" 
                        : "Aucun utilisateur ne correspond aux filtres actuels"
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  )
}