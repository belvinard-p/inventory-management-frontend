"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Trash2, 
  ChevronDown, 
  X,
  FileSpreadsheet,
} from "lucide-react"
import { ArticleResponse } from "@/types/article"
import { useArticles } from "@/hooks/article/useArticle"
import { enhancedToast } from "@/lib/toast-utils"

interface BulkActionsProps {
  selectedArticles: ArticleResponse[]
  onClearSelection: () => void
}

export function BulkActions({ selectedArticles, onClearSelection }: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteArticle } = useArticles()

  if (selectedArticles.length === 0) return null

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedArticles.length} article(s) ?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Supprimer tous les articles sélectionnés
      await Promise.all(
        selectedArticles.map(article => deleteArticle(article.id))
      )
      
      enhancedToast.success(`${selectedArticles.length} article(s) supprimé(s)`, {
        description: "Les articles sélectionnés ont été supprimés"
      })
      
      onClearSelection()
    } catch {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "Certains articles n'ont pas pu être supprimés"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      // En-têtes
      ["Code", "Désignation", "Catégorie", "Stock disponible", "Prix HT", "Prix TTC", "Statut"].join(","),
      // Données
      ...selectedArticles.map(article => [
        `"${article.codeArticle}"`,
        `"${article.designation}"`,
        `"${article.categoryDesignation}"`,
        article.availableQuantity.toString(),
        article.unitPriceExclTax.toString(),
        article.unitPriceAllTax.toString(),
        `"${article.status}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `articles_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    enhancedToast.success("Export réussi", {
      description: `${selectedArticles.length} article(s) exporté(s) en CSV`
    })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="gap-1">
        {selectedArticles.length} sélectionné(s)
      </Badge>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exporter en CSV
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Suppression..." : "Supprimer tout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}


