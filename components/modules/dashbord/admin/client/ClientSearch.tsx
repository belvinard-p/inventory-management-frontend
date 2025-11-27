"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientResponse } from '@/types/client/client'

interface ClientSearchProps {
  readonly data: ClientResponse[]
  readonly onFilteredData: (filtered: ClientResponse[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function ClientSearch({
  data,
  onFilteredData,
  placeholder = "Rechercher client..."
}: ClientSearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)

    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }

    const filtered = data.filter(client => {
      switch (value) {
        case "with-orders":
          return client.orders && client.orders.length > 0
        case "without-orders":
          return !client.orders || client.orders.length === 0
        case "with-address":
          return client.address && (client.address.address1 || client.address.city)
        case "without-address":
          return !client.address || (!client.address.address1 && !client.address.city)
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
          <SelectItem value="all">Tous les clients</SelectItem>
          <SelectItem value="with-orders">Avec commandes</SelectItem>
          <SelectItem value="without-orders">Sans commandes</SelectItem>
          <SelectItem value="with-address">Avec adresse</SelectItem>
          <SelectItem value="without-address">Sans adresse</SelectItem>
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