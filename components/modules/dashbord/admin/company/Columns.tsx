"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Company } from "@/types"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CompanyImage } from "./CompanyImage"

export const columns: ColumnDef<Company>[] = [
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
      <DataTableColumnHeader column={column} title="Nom de l'entreprise" />
    ),
    cell: ({ row }) => {
      const company = row.original
      
      return (
        <div className="flex items-center gap-3">
          <CompanyImage
            companyId={company.id}
            companyName={company.name}
            className="h-10 w-10 rounded-lg object-cover border"
            fallbackClassName="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
          />
          <div className="flex flex-col">
            <span className="font-medium">{company.name}</span>
            <span className="text-xs text-muted-foreground">{company.fiscalCode}</span>
          </div>
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
        <div className="flex flex-col">
          <span className="text-sm">{email}</span>
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
      const phone = row.getValue("phoneNumber") as string
      return <div className="font-mono text-sm">{phone}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]