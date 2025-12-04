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
import { SupplierOrderLine } from "@/types/supplier/supplierOrderLine"
import { enhancedToast } from "@/lib/toast-utils"

interface BulkActionsProps {
    selectedLines: SupplierOrderLine[]
    onClearSelection: () => void
    onBulkDelete: (ids: number[]) => Promise<void>
}

export function BulkActions({
    selectedLines,
    onClearSelection,
    onBulkDelete,
}: BulkActionsProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    if (selectedLines.length === 0) return null

    const handleBulkDelete = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedLines.length} ligne(s) ?`)) {
            return
        }

        setIsProcessing(true)
        try {
            const ids = selectedLines.map(line => line.id)
            await onBulkDelete(ids)

            enhancedToast.success(`${selectedLines.length} ligne(s) supprimée(s)`, {
                description: "Les lignes sélectionnées ont été supprimées"
            })

            onClearSelection()
        } catch {
            // Error already handled by apiClient via toast
        } finally {
            setIsProcessing(false)
        }
    }

    const handleExportCSV = () => {
        const csvContent = [
            // En-têtes
            ["Code Article", "Désignation", "Quantité", "Prix Unitaire", "Prix Total"].join(","),
            // Données
            ...selectedLines.map(line => [
                `"${line.articleCode || 'N/A'}"`,
                `"${line.articleDesignation || 'N/A'}"`,
                line.quantity.toString(),
                (line.unitPriceExclTax || 0).toFixed(2),
                (line.totalLinePrice || 0).toFixed(2)
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `lignes_commande_fournisseur_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        enhancedToast.success("Export réussi", {
            description: `${selectedLines.length} ligne(s) exportée(s) en CSV`
        })
    }

    const totalQuantity = selectedLines.reduce((sum, line) => sum + line.quantity, 0)
    const totalAmount = selectedLines.reduce((sum, line) => sum + (line.totalLinePrice || 0), 0)

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                    {selectedLines.length} sélectionnée(s)
                </Badge>
                <Badge variant="outline" className="gap-1">
                    Qté totale: {totalQuantity}
                </Badge>
                <Badge variant="default" className="gap-1">
                    Total: {totalAmount.toFixed(2)} €
                </Badge>
            </div>

            <div className="flex items-center gap-2 ml-auto">
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
