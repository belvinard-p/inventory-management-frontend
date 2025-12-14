"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Sale, SaleStatus } from "@/types/sale"
import { DataTableColumnHeader } from "../company/DataTableColumnHeader"
import { SaleDataTableRowActions } from "./SaleDataTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Receipt, MessageSquare, ShoppingCart } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ColumnsProps {
  onEdit: (sale: Sale) => void
  onView: (sale: Sale) => void
  isLoading?: boolean
}

const getStatusBadge = (status: SaleStatus) => {
  switch (status) {
    case SaleStatus.DRAFT:
      return <Badge variant="secondary">Brouillon</Badge>
    case SaleStatus.CONFIRMED:
      return <Badge variant="default">Confirmée</Badge>
    case SaleStatus.CANCELLED:
      return <Badge variant="destructive">Annulée</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const createColumns = ({
  onEdit,
  onView,
  isLoading = false,
}: ColumnsProps): ColumnDef<Sale>[] => [
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
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium flex-1">{code}</span>
          <CopyButton 
            text={code} 
            label="Code de vente"
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
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{clientName || "Client"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "clientOrderCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commande" />
    ),
    cell: ({ row }) => {
      const orderCode = row.getValue("clientOrderCode") as string | undefined
      return (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{orderCode || "-"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const saleDate = row.getValue("saleDate") as string
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {format(new Date(saleDate), "PP", { locale: fr })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as SaleStatus
      return getStatusBadge(status)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "saleLines",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lignes" />
    ),
    cell: ({ row }) => {
      const lines = row.getValue("saleLines") as Sale["saleLines"]
      const lineCount = lines?.length || 0
      return (
        <Badge variant={lineCount > 0 ? "default" : "secondary"}>
          {lineCount} ligne{lineCount !== 1 ? 's' : ''}
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
      <SaleDataTableRowActions 
        row={row} 
        onEdit={onEdit}
        onView={onView}
        isLoading={isLoading}
      />
    ),
  },
]