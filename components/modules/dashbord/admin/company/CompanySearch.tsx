"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Company } from '@/types'

interface CompanySearchProps {
  readonly data: Company[]
  readonly onFilteredData: (filtered: Company[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function CompanySearch({ 
  data, 
  onFilteredData, 
  placeholder = "Search companies..." 
}: CompanySearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    
    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }
    
    // Appliquer le filtre selon la valeur sélectionnée
    const filtered = data.filter(company => {
      switch (value) {
        case "with-website":
          return company.website && company.website.trim() !== ""
        case "without-website":
          return !company.website || company.website.trim() === ""
        case "with-categories":
          return company.categories && company.categories.length > 0
        case "without-categories":
          return Array.isArray(company.categories) && company.categories.length === 0
        case "with-suppliers":
          return company.suppliers && company.suppliers.length > 0
        case "without-suppliers":
          return Array.isArray(company.suppliers) && company.suppliers.length === 0
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
          <SelectItem value="all">Toutes les entreprises</SelectItem>
          <SelectItem value="with-website">Avec site web</SelectItem>
          <SelectItem value="without-website">Sans site web</SelectItem>
          <SelectItem value="with-categories">Avec catégories</SelectItem>
          <SelectItem value="without-categories">Sans catégories</SelectItem>
          <SelectItem value="with-suppliers">Avec fournisseurs</SelectItem>
          <SelectItem value="without-suppliers">Sans fournisseurs</SelectItem>
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