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
      <DataTableColumnHeader column={column} title="Entreprise" />
    ),
    cell: ({ row }) => {
      const company = row.original
      
      return (
        <div className="flex items-center gap-3">
          <CompanyImage
            companyId={company.id}
            companyName={company.name}
            className="h-8 w-8 rounded-full object-cover border"
            fallbackClassName="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
          />
          <div className="flex flex-col">
            <span className="font-medium">{company.name}</span>
            <span className="text-sm text-muted-foreground">{company.fiscalCode}</span>
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
      return <div className="lowercase">{email}</div>
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
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ville" />
    ),
    cell: ({ row }) => {
      const company = row.original
      const city = company.address?.city
      return city ? (
        <Badge variant="secondary">{city}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "website",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Site web" />
    ),
    cell: ({ row }) => {
      const website = row.getValue("website") as string
      return website ? (
        <a 
          href={`https://${website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          {website}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id) as string).toISOString().split('T')[0]
      return rowDate === value
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]