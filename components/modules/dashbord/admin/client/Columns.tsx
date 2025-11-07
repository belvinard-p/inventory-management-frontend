"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ClientResponse } from "@/types/client/client"
import { DataTableColumnHeader } from "../company/DataTableColumnHeader"
import { ClientDataTableRowActions } from "./ClientDataTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin } from "lucide-react"

export const columns: ColumnDef<ClientResponse>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center gap-2 group">
          <span className="font-medium flex-1">{name}</span>
          <CopyButton 
            text={name} 
            label="Nom du client"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="flex items-center gap-2 group">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">{email}</span>
          <CopyButton 
            text={email} 
            label="Email"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Téléphone" />
    ),
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string
      return (
        <div className="flex items-center gap-2 group">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono flex-1">{phoneNumber}</span>
          <CopyButton 
            text={phoneNumber} 
            label="Téléphone"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Adresse" />
    ),
    cell: ({ row }) => {
      const address = row.getValue("address") as ClientResponse["address"]
      const addressString = address 
        ? `${address.address1 || ''}${address.address2 ? `, ${address.address2}` : ''}${address.city ? `, ${address.city}` : ''}${address.postalCode ? ` ${address.postalCode}` : ''}${address.country ? `, ${address.country}` : ''}`.trim()
        : "N/A"
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {addressString}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "orders",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commandes" />
    ),
    cell: ({ row }) => {
      const orders = row.getValue("orders") as ClientResponse["orders"]
      const orderCount = orders?.length || 0
      return (
        <Badge variant={orderCount > 0 ? "default" : "secondary"}>
          {orderCount} commande{orderCount !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ClientDataTableRowActions row={row} />,
  },
]

