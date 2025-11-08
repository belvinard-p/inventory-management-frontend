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
import { ClientResponse } from "@/types/client/client"
import { useDeleteClient } from "@/hooks/client/useClient"
import { enhancedToast } from "@/lib/toast-utils"

interface BulkActionsProps {
  selectedClients: ClientResponse[]
  onClearSelection: () => void
}

export function BulkActions({ selectedClients, onClearSelection }: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteMutation = useDeleteClient()

  if (selectedClients.length === 0) return null

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedClients.length} client(s) ?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      for (const client of selectedClients) {
        await new Promise<void>((resolve, reject) => {
          deleteMutation.mutate(client.id, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error)
          })
        })
      }
      
      enhancedToast.success(`${selectedClients.length} client(s) supprimé(s)`, {
        description: "Les clients sélectionnés ont été supprimés"
      })
      
      onClearSelection()
    } catch {
      // Error already handled by apiClient via toast
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      // En-têtes
      ["Nom", "Email", "Téléphone", "Ville", "Code postal", "Pays", "Commandes"].join(","),
      // Données
      ...selectedClients.map(client => [
        `"${client.name}"`,
        `"${client.email}"`,
        `"${client.phoneNumber}"`,
        `"${client.address?.city || ''}"`,
        `"${client.address?.postalCode || ''}"`,
        `"${client.address?.country || ''}"`,
        (client.orders?.length || 0).toString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `clients_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    enhancedToast.success("Export réussi", {
      description: `${selectedClients.length} client(s) exporté(s) en CSV`
    })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="gap-1">
        {selectedClients.length} sélectionné(s)
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