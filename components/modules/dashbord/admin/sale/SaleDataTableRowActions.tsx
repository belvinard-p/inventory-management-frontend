"use client"

import { Row } from "@tanstack/react-table"
import { Sale, SaleStatus } from "@/types/sale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Play,
  FileText,
} from "lucide-react"
import { useState } from "react"
import { DeleteConfirmDialog } from "@/components/global"
import { useDeleteSale, useUpdateSaleStatus, useCancelSale, useFinalizeSale, useGenerateSaleLines } from "@/hooks/useSales"
import { toast } from "sonner"

interface SaleDataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit: (sale: Sale) => void
  onView?: (sale: Sale) => void
  isLoading?: boolean
}

export function SaleDataTableRowActions<TData>({
  row,
  onEdit,
  onView,
  isLoading = false,
}: SaleDataTableRowActionsProps<TData>) {
  const sale = row.original as Sale
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteMutation = useDeleteSale()
  const updateStatusMutation = useUpdateSaleStatus()
  const cancelMutation = useCancelSale()
  const finalizeMutation = useFinalizeSale()
  const generateLinesMutation = useGenerateSaleLines()

  const handleDelete = async () => {
    deleteMutation.mutate(sale.id, {
      onSuccess: () => {
        toast.success("Vente supprimée avec succès")
        setIsDeleteDialogOpen(false)
      },
      onError: () => {
        toast.error("Erreur lors de la suppression")
      }
    })
  }

  const handleStatusChange = (status: SaleStatus) => {
    updateStatusMutation.mutate({ id: sale.id, status }, {
      onSuccess: () => {
        toast.success("Statut mis à jour avec succès")
      },
      onError: () => {
        toast.error("Erreur lors de la mise à jour du statut")
      }
    })
  }

  const handleCancel = () => {
    cancelMutation.mutate(sale.id, {
      onSuccess: () => {
        toast.success("Vente annulée avec succès")
      },
      onError: () => {
        toast.error("Erreur lors de l'annulation")
      }
    })
  }

  const handleFinalize = () => {
    finalizeMutation.mutate(sale.id, {
      onSuccess: () => {
        toast.success("Vente finalisée avec succès")
      },
      onError: () => {
        toast.error("Erreur lors de la finalisation")
      }
    })
  }

  const handleGenerateLines = () => {
    generateLinesMutation.mutate(sale.id, {
      onSuccess: () => {
        toast.success("Lignes de vente générées avec succès")
      },
      onError: () => {
        toast.error("Erreur lors de la génération des lignes")
      }
    })
  }

  const canEdit = sale.status === SaleStatus.DRAFT
  const canDelete = sale.status === SaleStatus.DRAFT
  const canCancel = sale.status === SaleStatus.DRAFT
  const canFinalize = sale.status === SaleStatus.CONFIRMED
  const canGenerateLines = sale.status !== SaleStatus.CANCELLED

  return (
    <>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions pour {sale.code}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions vente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => onView?.(sale)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Détails</span>
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(sale)}
              className="text-green-600 hover:text-green-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {sale.status === SaleStatus.DRAFT && (
            <DropdownMenuItem
              onClick={() => handleStatusChange(SaleStatus.CONFIRMED)}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmer</span>
            </DropdownMenuItem>
          )}

          {canFinalize && (
            <DropdownMenuItem
              onClick={handleFinalize}
              className="text-purple-600 hover:text-purple-700"
            >
              <Play className="mr-2 h-4 w-4" />
              <span>Finaliser</span>
            </DropdownMenuItem>
          )}

          {canGenerateLines && (
            <DropdownMenuItem
              onClick={handleGenerateLines}
              className="text-orange-600 hover:text-orange-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Générer lignes</span>
            </DropdownMenuItem>
          )}

          {canCancel && (
            <DropdownMenuItem
              onClick={handleCancel}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Annuler</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && (
            <DropdownMenuItem
              className="text-red-600 hover:text-red-700"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Supprimer</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={sale.code}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}