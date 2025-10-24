"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableViewOptions } from "./DataTableViewOptions"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectValue, setSelectValue] = React.useState("")

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    table.resetColumnFilters()
    
    if (value === "all") return
    
    // Filtres spécifiques aux entreprises
    if (value === "with-website") {
      table.getColumn("website")?.setFilterValue((value: string) => !!value)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
        <Select value={selectValue} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-8 w-full xs:w-[200px] sm:w-[220px]">
            <SelectValue placeholder="Rechercher des entreprises..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les entreprises</SelectItem>
            <SelectItem value="with-website">Avec site web</SelectItem>
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              setSelectValue("")
            }}
            className="h-8 px-2 lg:px-3"
          >
            Réinitialiser
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <DataTableViewOptions table={table} />
    </div>
  )
}