"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ClientOrderResponse, OrderStatus } from "@/types/client/clientOrder"
import { DataTableColumnHeader } from "../../company/DataTableColumnHeader"
import { CmdClientDataTableRowActions } from "./CmdClientDataTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Package, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ColumnsProps {
  onDelete: (id: number) => Promise<void>
  onUpdateStatus: (id: number, status: OrderStatus) => Promise<void>
  onCancel: (id: number) => Promise<void>
  isLoading?: boolean
}

export const createColumns = ({
  onDelete,
  onUpdateStatus,
  onCancel,
  isLoading = false,
}: ColumnsProps): ColumnDef<ClientOrderResponse>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="translate-y-[2px] w-full md:w-auto"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      return (
        <div className="flex items-center gap-2 group">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium flex-1">{code}</span>
          <CopyButton 
            text={code} 
            label="Code de commande"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      const clientName = row.getValue("clientName") as string | undefined
      const order = row.original as ClientOrderResponse
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{clientName || `Client #${order.clientId}`}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const orderDate = row.getValue("orderDate") as string
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {format(new Date(orderDate), "PP", { locale: fr })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "stateOrder",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("stateOrder") as string
      const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        PENDING: { label: "En attente", variant: "secondary" },
        CONFIRMED: { label: "Confirmée", variant: "default" },
        COMPLETED: { label: "Complétée", variant: "outline" },
        CANCELLED: { label: "Annulée", variant: "destructive" },
      }
      const config = statusConfig[status] || { label: status, variant: "outline" }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "orderClientLineList",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articles" />
    ),
    cell: ({ row }) => {
      const lines = row.getValue("orderClientLineList") as ClientOrderResponse["orderClientLineList"]
      const lineCount = lines?.length || 0
      return (
        <Badge variant={lineCount > 0 ? "default" : "secondary"}>
          {lineCount} article{lineCount !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  {
    accessorKey: "comments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commentaires" />
    ),
    cell: ({ row }) => {
      const comments = row.getValue("comments") as string | undefined
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          {comments ? (
            <>
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{comments}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CmdClientDataTableRowActions 
        row={row} 
        onDelete={onDelete}
        onUpdateStatus={onUpdateStatus}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    ),
  },
]
