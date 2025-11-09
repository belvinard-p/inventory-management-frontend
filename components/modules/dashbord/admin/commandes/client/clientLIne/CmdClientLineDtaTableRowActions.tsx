"use client"

import { Row } from "@tanstack/react-table"
import { OrderClientLineResponse } from "@/types/client/orderClientLine"
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
  Plus,
  Minus,
} from "lucide-react"
import { useCmdClientLineContext } from "./CmdClientLineContext"
import { DeleteConfirmDialog } from "@/components/global"
import { CmdClientLineDetailsDialog } from "./CmdClientLineDetailsDialog"
import { useState } from "react"

interface CmdClientLineDataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete: (id: number) => Promise<void>
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>
  isLoading?: boolean
}

export function CmdClientLineDataTableRowActions<TData>({
  row,
  onDelete,
  onUpdateQuantity,
  isLoading = false,
}: CmdClientLineDataTableRowActionsProps<TData>) {
  const line = row.original as OrderClientLineResponse
  const { onEditLine } = useCmdClientLineContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleDelete = async () => {
    await onDelete(line.id)
    setIsDeleteDialogOpen(false)
  }

  const handleIncreaseQuantity = async () => {
    await onUpdateQuantity(line.id, line.quantity + 1)
  }

  const handleDecreaseQuantity = async () => {
    if (line.quantity > 1) {
      await onUpdateQuantity(line.id, line.quantity - 1)
    }
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
                  <span className="sr-only">Actions pour {line.articleCode}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions ligne</p>
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
            onClick={() => onEditLine(line)} 
            className="text-green-600 hover:text-green-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Modifier</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Actions de quantité */}
          <DropdownMenuItem
            onClick={handleIncreaseQuantity}
            className="text-blue-600 hover:text-blue-700"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Augmenter quantité</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleDecreaseQuantity}
            className="text-orange-600 hover:text-orange-700"
            disabled={isLoading || line.quantity <= 1}
          >
            <Minus className="mr-2 h-4 w-4" />
            <span>Diminuer quantité</span>
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
        itemName={`${line.articleCode} (Qté: ${line.quantity})`}
        isLoading={isLoading}
      />
      
      <CmdClientLineDetailsDialog
        line={line}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </>
  )
}
