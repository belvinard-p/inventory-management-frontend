"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SupplierOrder } from '@/types/supplier/supplierOrder'

interface CmdSupplierSearchProps {
  readonly data: SupplierOrder[]
  readonly onFilteredData: (filtered: SupplierOrder[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function CmdSupplierSearch({ 
  data, 
  onFilteredData, 
  placeholder = "Rechercher commande fournisseur..." 
}: CmdSupplierSearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    
    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }
    
    const filtered = data.filter(order => {
      switch (value) {
        case "pending":
          return order.stateOrder?.toUpperCase() === "PENDING"
        case "confirmed":
          return order.stateOrder?.toUpperCase() === "CONFIRMED"
        case "completed":
          return order.stateOrder?.toUpperCase() === "COMPLETED"
        case "cancelled":
          return order.stateOrder?.toUpperCase() === "CANCELLED"
        case "with-lines":
          return order.supplierOrderLineList && order.supplierOrderLineList.length > 0
        case "without-lines":
          return !order.supplierOrderLineList || order.supplierOrderLineList.length === 0
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
          <SelectItem value="all">Toutes les commandes</SelectItem>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="confirmed">Confirmées</SelectItem>
          <SelectItem value="completed">Complétées</SelectItem>
          <SelectItem value="cancelled">Annulées</SelectItem>
          <SelectItem value="with-lines">Avec articles</SelectItem>
          <SelectItem value="without-lines">Sans articles</SelectItem>
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