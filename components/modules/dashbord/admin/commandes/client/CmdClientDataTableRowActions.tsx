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
import { CmdClientStatusDialog } from "./CmdClientStatusDialog"
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
  onOrderUpdate,
  isLoading = false,
}: CmdClientDataTableRowActionsProps<TData>) {
  const order = row.original as ClientOrderResponse
  const { onEditOrder } = useCmdClientContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const handleDelete = async () => {
    await onDelete(order.id)
    setIsDeleteDialogOpen(false)
  }

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    await onUpdateStatus(orderId, newStatus)
    onOrderUpdate?.()
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

          {/* Action de changement de statut */}
          <DropdownMenuItem
            onClick={() => setIsStatusDialogOpen(true)}
            className="text-purple-600 hover:text-purple-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Changer le statut</span>
          </DropdownMenuItem>

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

      <CmdClientStatusDialog
        order={order}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </>
  )
}
