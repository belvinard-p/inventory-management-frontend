"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArticleResponse } from "@/types/article"
import { DataTableColumnHeader } from "../company/DataTableColumnHeader"
import { ArticleDataTableRowActions } from "./ArticleDataTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { ArticleStatus } from "@/types/article"

export const columns: ColumnDef<ArticleResponse>[] = [
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
    accessorKey: "codeArticle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code Article" />
    ),
    cell: ({ row }) => {
      const code = row.getValue("codeArticle") as string
      return (
        <div className="flex items-center gap-2 group">
          <span className="font-mono text-sm font-medium flex-1">{code}</span>
          <CopyButton 
            text={code} 
            label="Code Article"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Désignation" />
    ),
    cell: ({ row }) => {
      const article = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{article.designation}</span>
          <span className="text-xs text-muted-foreground">{article.categoryDesignation}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "availableQuantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock disponible" />
    ),
    cell: ({ row }) => {
      const article = row.original
      const isLowStock = article.availableQuantity <= 10 && article.availableQuantity > 0
      const isOutOfStock = article.availableQuantity === 0
      
      return (
        <div className="flex flex-col">
          <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : ''}`}>
            {article.availableQuantity}
          </span>
          <span className="text-xs text-muted-foreground">
            Stock: {article.quantityInStock} | Réservé: {article.reservedQuantity}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "unitPriceExclTax",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prix unitaire HT" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("unitPriceExclTax") as number
      const article = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{price.toFixed(2)} €</span>
          <span className="text-xs text-muted-foreground">
            TTC: {article.unitPriceAllTax.toFixed(2)} € (TVA {article.rateTva}%)
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
      const status = row.getValue("status") as ArticleStatus
      return (
        <Badge variant={status === ArticleStatus.ACTIVE ? "default" : "secondary"}>
          {status === ArticleStatus.ACTIVE ? "Actif" : "Archivé"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return row.getValue(id) === value
    },
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdDate") as string
      return (
        <div className="text-sm">
          {date ? new Date(date).toLocaleDateString('fr-FR') : ""}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ArticleDataTableRowActions row={row} />,
  },
]

