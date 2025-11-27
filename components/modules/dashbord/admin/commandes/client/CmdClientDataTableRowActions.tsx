"use client"

import { Row } from "@tanstack/react-table"
import { ClientOrderResponse, OrderStatus } from "@/types/client/clientOrder"
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
} from "lucide-react"
import { useCmdClientContext } from "./CmdClientContext"
import { DeleteConfirmDialog } from "@/components/global"
import { CmdClientDetailsDialog } from "./CmdClientDetailsDialog"
import { useState } from "react"

interface CmdClientDataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete: (id: number) => Promise<void>
  onUpdateStatus: (id: number, status: OrderStatus) => Promise<void>
  onCancel: (id: number) => Promise<void>
  onOrderUpdate?: () => void
  isLoading?: boolean
}

export function CmdClientDataTableRowActions<TData>({
  row,
  onDelete,
  onUpdateStatus,
  onCancel,
  onOrderUpdate,
  isLoading = false,
}: CmdClientDataTableRowActionsProps<TData>) {
  const order = row.original as ClientOrderResponse
  const { onEditOrder } = useCmdClientContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Vérifier si une commande CONFIRMED peut être remise à PENDING (30 jours max)
  const canRevertToPending = () => {
    if (order.stateOrder !== 'CONFIRMED') return false
    
    const confirmedDate = new Date(order.updatedDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - confirmedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysDiff <= 30
  }

  const getDaysRemainingForRevert = () => {
    if (order.stateOrder !== 'CONFIRMED') return null
    
    const confirmedDate = new Date(order.updatedDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - confirmedDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = 30 - daysDiff
    
    return Math.max(0, daysRemaining)
  }

  const handleDelete = async () => {
    await onDelete(order.id)
    setIsDeleteDialogOpen(false)
  }

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
                  className="h-8 w-8 p-0 hover:bg-muted/50 data-[state=open]:bg-muted transition-colors duration-200 rounded-md"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  <span className="sr-only">Actions pour {order.code}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions commande</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-border/50">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setIsDetailsDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Détails</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onEditOrder(order)} 
            className="text-green-600 hover:text-green-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Modifier</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Actions de changement de statut */}
          {order.stateOrder === "PENDING" && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(order.id, OrderStatus.CONFIRMED)}
              className="text-blue-600 hover:text-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Confirmer</span>
            </DropdownMenuItem>
          )}
          
          {order.stateOrder === "CONFIRMED" && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Marquer complétée</span>
            </DropdownMenuItem>
          )}
          
          {/* Option pour remettre à PENDING si CONFIRMED et dans les 30 jours */}
          {canRevertToPending() && (
            <DropdownMenuItem
              onClick={() => onUpdateStatus(order.id, OrderStatus.PENDING)}
              className="text-amber-600 hover:text-amber-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Remettre en attente ({getDaysRemainingForRevert()} j)</span>
            </DropdownMenuItem>
          )}
          
          {order.stateOrder === "CONFIRMED" && !canRevertToPending() && (
            <DropdownMenuItem disabled className="text-gray-400">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Remettre en attente (délai dépassé)</span>
            </DropdownMenuItem>
          )}
          
          {order.stateOrder !== "CANCELLED" && order.stateOrder !== "COMPLETED" && (
            <DropdownMenuItem
              onClick={() => onCancel(order.id)}
              className="text-orange-600 hover:text-orange-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span>Annuler commande</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            className="text-red-600 hover:text-red-700 focus:text-red-700"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Supprimer</span>
            <DropdownMenuShortcut className="text-red-600">⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={order.code}
        isLoading={isLoading}
      />
      
      <CmdClientDetailsDialog
        order={order}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onOrderUpdate={onOrderUpdate}
      />
    </>
  )
}
