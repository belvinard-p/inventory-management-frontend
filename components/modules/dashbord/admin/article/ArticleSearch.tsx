"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArticleResponse, ArticleStatus } from '@/types/article'

interface ArticleSearchProps {
  readonly data: ArticleResponse[]
  readonly onFilteredData: (filtered: ArticleResponse[], hasFilter?: boolean) => void
  readonly placeholder?: string
}

export function ArticleSearch({ 
  data, 
  onFilteredData, 
  placeholder = "Rechercher article..." 
}: ArticleSearchProps) {
  const [selectValue, setSelectValue] = React.useState("")
  const isFiltered = selectValue !== "" && selectValue !== "all"

  const handleFilterChange = (value: string) => {
    setSelectValue(value)
    
    if (value === "all" || value === "") {
      onFilteredData(data, false)
      return
    }
    
    // Appliquer le filtre selon la valeur sélectionnée
    const filtered = data.filter(article => {
      switch (value) {
        case "active":
          return article.status === ArticleStatus.ACTIVE
        case "archived":
          return article.status === ArticleStatus.ARCHIVED
        case "with-image":
          return article.image && article.image.trim() !== ""
        case "without-image":
          return !article.image || article.image.trim() === ""
        case "low-stock":
          return article.availableQuantity < 10
        case "out-of-stock":
          return article.availableQuantity === 0
        case "in-stock":
          return article.availableQuantity > 10
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
          <SelectItem value="all">Tous les articles</SelectItem>
          <SelectItem value="active">Actifs</SelectItem>
          <SelectItem value="archived">Archivés</SelectItem>
          <SelectItem value="with-image">Avec image</SelectItem>
          <SelectItem value="without-image">Sans image</SelectItem>
          <SelectItem value="in-stock">En stock</SelectItem>
          <SelectItem value="low-stock">Stock faible</SelectItem>
          <SelectItem value="out-of-stock">Rupture de stock</SelectItem>
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


