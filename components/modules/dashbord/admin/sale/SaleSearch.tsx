"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sale } from '@/types/sale'

interface SaleSearchProps {
  readonly data: Sale[]
  readonly onFilteredData: (filtered: Sale[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function SaleSearch({ 
  data, 
  onFilteredData, 
  placeholder = "Rechercher vente..." 
}: SaleSearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    
    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }
    
    const filtered = data.filter(sale => {
      switch (value) {
        case "draft":
          return sale.status === "DRAFT"
        case "confirmed":
          return sale.status === "CONFIRMED"
        case "cancelled":
          return sale.status === "CANCELLED"
        case "with-lines":
          return sale.saleLines && sale.saleLines.length > 0
        case "without-lines":
          return !sale.saleLines || sale.saleLines.length === 0
        default:
          return true
      }
    })
    
    onFilteredData(filtered, true)
  }

  const handleReset = () => {
    setSelectValue("")
    onFilteredData(data, false)
  }

  return (
    <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
      <Select value={selectValue} onValueChange={handleFilterChange}>
        <SelectTrigger className="h-8 w-full xs:w-[200px] sm:w-[220px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les ventes</SelectItem>
          <SelectItem value="draft">Brouillons</SelectItem>
          <SelectItem value="confirmed">Confirmées</SelectItem>
          <SelectItem value="cancelled">Annulées</SelectItem>
          <SelectItem value="with-lines">Avec lignes</SelectItem>
          <SelectItem value="without-lines">Sans lignes</SelectItem>
        </SelectContent>
      </Select>
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="h-8 px-2 lg:px-3"
        >
          Réinitialiser
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}