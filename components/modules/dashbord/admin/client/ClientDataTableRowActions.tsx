"use client"

import { Row } from "@tanstack/react-table"
import { ClientResponse } from "@/types/client/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
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
} from "lucide-react"
import { useDeleteClient } from "@/hooks/client/useClient"
import { useClientContext } from "./ClientContext"
import { DeleteConfirmDialog } from "@/components/global"
import { ClientDetailsDialog } from "./ClientDetailsDialog"
import { useState } from "react"

interface ClientDataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function ClientDataTableRowActions<TData>({
  row,
}: ClientDataTableRowActionsProps<TData>) {
  const client = row.original as ClientResponse
  const { onEditClient } = useClientContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const deleteMutation = useDeleteClient()

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
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  <span className="sr-only">Actions pour {client.name}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions client</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-border/50">
          <DropdownMenuItem 
            onClick={() => setIsDetailsDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Détails</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onEditClient(client)} className="text-green-600 hover:text-green-700">
            <Edit className="mr-2 h-4 w-4" />
            <span>Modifier</span>
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
        onConfirm={() => {
          deleteMutation.mutate(client.id, {
            onSuccess: () => setIsDeleteDialogOpen(false)
          })
        }}
        itemName={client.name}
        isLoading={deleteMutation.isPending}
      />
      
      <ClientDetailsDialog
        client={client}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </>
  )
}

