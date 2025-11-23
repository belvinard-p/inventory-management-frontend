"use client"

import { ColumnDef } from "@tanstack/react-table"
import { OrderClientLineResponse } from "@/types/client/orderClientLine"
import { DataTableColumnHeader } from "../../../company/DataTableColumnHeader"
import { CmdClientLineDataTableRowActions } from "./CmdClientLineDtaTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { Package, Hash, DollarSign } from "lucide-react"

interface ColumnsProps {
  onDelete: (id: number) => Promise<void>
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>
  isLoading?: boolean
}

export const createColumns = ({
  onDelete,
  onUpdateQuantity,
  isLoading = false,
}: ColumnsProps): ColumnDef<OrderClientLineResponse>[] => [
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
      accessorKey: "articleCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code Article" />
      ),
      cell: ({ row }) => {
        const code = row.getValue("articleCode") as string
        return (
          <div className="flex items-center gap-2 group">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium flex-1">{code || "N/A"}</span>
            {code && (
              <CopyButton
                text={code}
                label="Code article"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "articleDesignation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Désignation" />
      ),
      cell: ({ row }) => {
        const designation = row.getValue("articleDesignation") as string | undefined
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{designation || "Article non trouvé"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quantité" />
      ),
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number
        return (
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Badge variant={quantity < 1 ? "destructive" : quantity <= 20 ? "secondary" : "default"}>
              {quantity}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "unitPriceExclTax",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Prix Unitaire" />
      ),
      cell: ({ row }) => {
        const unitPrice = row.getValue("unitPriceExclTax") as number
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {(unitPrice || 0).toFixed(2)} xaf
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "totalLinePrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Prix Total" />
      ),
      cell: ({ row }) => {
        const totalPrice = row.getValue("totalLinePrice") as number
        return (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-bold text-primary-600">
              {(totalPrice || 0).toFixed(2)} xaf
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CmdClientLineDataTableRowActions
          row={row}
          onDelete={onDelete}
          onUpdateQuantity={onUpdateQuantity}
          isLoading={isLoading}
        />
      ),
    },
  ]
