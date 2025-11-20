"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderClientLineResponse } from '@/types/client/orderClientLine'

interface CmdClientLineSearchProps {
  readonly data: OrderClientLineResponse[]
  readonly onFilteredData: (filtered: OrderClientLineResponse[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function CmdClientLineSearch({ 
  data, 
  onFilteredData, 
  placeholder = "Filtrer les lignes..." 
}: CmdClientLineSearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    
    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }
    
    const filtered = data.filter(line => {
      switch (value) {
        case "low-quantity":
          return line.quantity <= 5
        case "medium-quantity":
          return line.quantity > 5 && line.quantity <= 20
        case "high-quantity":
          return line.quantity > 20
        case "high-price":
          return line.totalPrice > 1000
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
          <SelectItem value="all">Toutes les lignes</SelectItem>
          <SelectItem value="low-quantity">Quantité faible (≤ 5)</SelectItem>
          <SelectItem value="medium-quantity">Quantité moyenne (6-20)</SelectItem>
          <SelectItem value="high-quantity">Quantité élevée (&gt; 20)</SelectItem>
          <SelectItem value="high-price">Prix élevé (&gt; 1000€)</SelectItem>
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
