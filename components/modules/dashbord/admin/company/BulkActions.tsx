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
  Download, 
  ChevronDown, 
  X,
  FileSpreadsheet,
  Mail
} from "lucide-react"
import { Company } from "@/types"
import { useCompanies } from "@/hooks/useCompany"
import { enhancedToast } from "@/lib/toast-utils"

interface BulkActionsProps {
  selectedCompanies: Company[]
  onClearSelection: () => void
}

export function BulkActions({ selectedCompanies, onClearSelection }: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteCompany } = useCompanies()

  if (selectedCompanies.length === 0) return null

  const handleBulkDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCompanies.length} entreprise(s) ?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      // Supprimer toutes les entreprises sélectionnées
      await Promise.all(
        selectedCompanies.map(company => deleteCompany(company.id))
      )
      
      enhancedToast.success(`${selectedCompanies.length} entreprise(s) supprimée(s)`, {
        description: "Les entreprises sélectionnées ont été supprimées"
      })
      
      onClearSelection()
    } catch (error) {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "Certaines entreprises n'ont pas pu être supprimées"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      // En-têtes
      ["Nom", "Email", "Téléphone", "Site web", "Ville", "Code fiscal"].join(","),
      // Données
      ...selectedCompanies.map(company => [
        `"${company.name}"`,
        `"${company.email}"`,
        `"${company.phoneNumber}"`,
        `"${company.website || ''}"`,
        `"${company.address?.city || ''}"`,
        `"${company.fiscalCode}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `entreprises_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    enhancedToast.success("Export réussi", {
      description: `${selectedCompanies.length} entreprise(s) exportée(s) en CSV`
    })
  }

  const handleEmailAll = () => {
    const emails = selectedCompanies.map(c => c.email).join(";")
    window.location.href = `mailto:${emails}`
    
    enhancedToast.info("Client email ouvert", {
      description: `${selectedCompanies.length} destinataire(s) ajouté(s)`
    })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <Badge variant="secondary" className="gap-1">
        {selectedCompanies.length} sélectionnée(s)
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
            
            <DropdownMenuItem onClick={handleEmailAll}>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer un email groupé
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