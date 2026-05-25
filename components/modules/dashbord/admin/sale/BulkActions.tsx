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
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Sale, SaleStatus } from "@/types/sale"
import { enhancedToast } from "@/lib/toast-utils"

interface BulkActionsProps {
  selectedSales: Sale[]
  onClearSelection: () => void
  onBulkDelete: (ids: number[]) => Promise<void>
  onBulkUpdateStatus: (ids: number[], status: SaleStatus) => Promise<void>
  onBulkCancel: (ids: number[]) => Promise<void>
}

export function BulkActions({
  selectedSales,
  onClearSelection,
  onBulkDelete,
  onBulkUpdateStatus,
  onBulkCancel,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (selectedSales.length === 0) return null

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSales.length} vente(s) ?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const ids = selectedSales.map(sale => sale.id)
      await onBulkDelete(ids)

      enhancedToast.success(`${selectedSales.length} vente(s) supprimée(s)`, {
        description: "Les ventes sélectionnées ont été supprimées"
      })

      onClearSelection()
    } catch {
      // Error already handled by apiClient via toast
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkConfirm = async () => {
    const draftSales = selectedSales.filter(s => s.status === "DRAFT")
    if (draftSales.length === 0) {
      enhancedToast.error("Aucune vente en brouillon", {
        description: "Seules les ventes en brouillon peuvent être confirmées"
      })
      return
    }

    setIsProcessing(true)
    try {
      const ids = draftSales.map(sale => sale.id)
      await onBulkUpdateStatus(ids, SaleStatus.CONFIRMED)

      enhancedToast.success(`${draftSales.length} vente(s) confirmée(s)`, {
        description: "Les ventes ont été confirmées avec succès"
      })

      onClearSelection()
    } catch {
      // Error already handled
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkCancel = async () => {
    const cancelableSales = selectedSales.filter(
      s => s.status !== "CANCELLED"
    )

    if (cancelableSales.length === 0) {
      enhancedToast.error("Aucune vente annulable", {
        description: "Les ventes déjà annulées ne peuvent pas être annulées"
      })
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir annuler ${cancelableSales.length} vente(s) ?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const ids = cancelableSales.map(sale => sale.id)
      await onBulkCancel(ids)

      enhancedToast.success(`${cancelableSales.length} vente(s) annulée(s)`, {
        description: "Les ventes ont été annulées"
      })

      onClearSelection()
    } catch {
      // Error already handled
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      // En-têtes
      ["Code", "Client", "Commande", "Date", "Statut", "Lignes", "Commentaires"].join(","),
      // Données
      ...selectedSales.map(sale => [
        `"${sale.code}"`,
        `"${sale.clientName || 'Client'}"`,
        `"${sale.clientOrderCode || ''}"`,
        `"${new Date(sale.saleDate).toLocaleDateString('fr-FR')}"`,
        `"${sale.status}"`,
        (sale.saleLines?.length || 0).toString(),
        `"${sale.comments || ''}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ventes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    enhancedToast.success("Export réussi", {
      description: `${selectedSales.length} vente(s) exportée(s) en CSV`
    })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="gap-1">
        {selectedSales.length} sélectionnée(s)
      </Badge>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
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
              onClick={handleBulkConfirm}
              disabled={isProcessing}
              className="text-blue-600 focus:text-blue-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Traitement..." : "Confirmer les ventes"}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleBulkCancel}
              disabled={isProcessing}
              className="text-orange-600 focus:text-orange-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Traitement..." : "Annuler les ventes"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isProcessing ? "Suppression..." : "Supprimer tout"}
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