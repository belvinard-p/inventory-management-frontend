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
import { SupplierOrder, OrderStatus } from "@/types/supplier/supplierOrder"
import { toast } from "sonner"

interface BulkActionsProps {
  selectedOrders: SupplierOrder[]
  onClearSelection: () => void
  onBulkDelete: (ids: number[]) => Promise<void>
  onBulkUpdateStatus: (ids: number[], status: OrderStatus) => Promise<void>
  onBulkCancel: (ids: number[]) => Promise<void>
}

export function BulkActions({ 
  selectedOrders, 
  onClearSelection,
  onBulkDelete,
  onBulkUpdateStatus,
  onBulkCancel,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (selectedOrders.length === 0) return null

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedOrders.length} commande(s) ?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const ids = selectedOrders.map(order => order.id)
      await onBulkDelete(ids)
      
      toast.success(`${selectedOrders.length} commande(s) supprimée(s)`, {
        description: "Les commandes sélectionnées ont été supprimées"
      })
      
      onClearSelection()
    } catch {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkConfirm = async () => {
    const pendingOrders = selectedOrders.filter(o => o.stateOrder === "PENDING")
    if (pendingOrders.length === 0) {
      toast.error("Aucune commande en attente", {
        description: "Seules les commandes en attente peuvent être confirmées"
      })
      return
    }

    setIsProcessing(true)
    try {
      const ids = pendingOrders.map(order => order.id)
      await onBulkUpdateStatus(ids, OrderStatus.CONFIRMED)
      
      toast.success(`${pendingOrders.length} commande(s) confirmée(s)`, {
        description: "Les commandes ont été confirmées avec succès"
      })
      
      onClearSelection()
    } catch {
      toast.error("Erreur lors de la confirmation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkComplete = async () => {
    const confirmedOrders = selectedOrders.filter(o => o.stateOrder === "CONFIRMED")
    if (confirmedOrders.length === 0) {
      toast.error("Aucune commande confirmée", {
        description: "Seules les commandes confirmées peuvent être complétées"
      })
      return
    }

    setIsProcessing(true)
    try {
      const ids = confirmedOrders.map(order => order.id)
      await onBulkUpdateStatus(ids, OrderStatus.COMPLETED)
      
      toast.success(`${confirmedOrders.length} commande(s) complétée(s)`, {
        description: "Les commandes ont été marquées comme complétées"
      })
      
      onClearSelection()
    } catch {
      toast.error("Erreur lors de la completion")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkCancel = async () => {
    const cancelableOrders = selectedOrders.filter(
      o => o.stateOrder !== "CANCELLED" && o.stateOrder !== "COMPLETED"
    )
    
    if (cancelableOrders.length === 0) {
      toast.error("Aucune commande annulable", {
        description: "Les commandes complétées ou déjà annulées ne peuvent pas être annulées"
      })
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir annuler ${cancelableOrders.length} commande(s) ?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const ids = cancelableOrders.map(order => order.id)
      await onBulkCancel(ids)
      
      toast.success(`${cancelableOrders.length} commande(s) annulée(s)`, {
        description: "Les commandes ont été annulées"
      })
      
      onClearSelection()
    } catch {
      toast.error("Erreur lors de l'annulation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      ["Code", "Fournisseur", "Date", "Statut", "Articles", "Commentaires"].join(","),
      ...selectedOrders.map(order => [
        `"${order.code}"`,
        `"${order.supplierName || `Fournisseur #${order.supplierId}`}"`,
        `"${new Date(order.orderDate).toLocaleDateString('fr-FR')}"`,
        `"${order.stateOrder}"`,
        (order.supplierOrderLineList?.length || 0).toString(),
        `"${order.comments || ''}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `commandes_fournisseur_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Export réussi", {
      description: `${selectedOrders.length} commande(s) exportée(s) en CSV`
    })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="gap-1">
        {selectedOrders.length} sélectionnée(s)
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
              {isProcessing ? "Traitement..." : "Confirmer les commandes"}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleBulkComplete}
              disabled={isProcessing}
              className="text-green-600 focus:text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Traitement..." : "Marquer comme complétées"}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleBulkCancel}
              disabled={isProcessing}
              className="text-orange-600 focus:text-orange-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Traitement..." : "Annuler les commandes"}
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