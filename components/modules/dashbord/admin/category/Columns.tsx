import { ColumnDef } from "@tanstack/react-table"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CategoryResponse } from "@/types/category"

export const columns: ColumnDef<CategoryResponse>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "designation",
    header: "Désignation",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">
            {row.getValue("designation")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate text-sm text-muted-foreground">
            {description || "Aucune description"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "active",
    header: "Statut",
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="capitalize">
          {isActive ? (
            <>
              <Check className="mr-1 h-3 w-3" /> Actif
            </>
          ) : (
            <>
              <X className="mr-1 h-3 w-3" /> Inactif
            </>
          )}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdDate",
    header: "Créé le",
    cell: ({ row }) => {
      const dateValue = row.getValue("createdDate") as string
      if (!dateValue) return <div className="text-sm text-muted-foreground">-</div>
      
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return <div className="text-sm text-muted-foreground">-</div>
      
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "PPp", { locale: fr })}
        </div>
      )
    },
  },
  {
    accessorKey: "updatedDate",
    header: "Mis à jour le",
    cell: ({ row }) => {
      const dateValue = row.getValue("updatedDate") as string
      if (!dateValue) return <div className="text-sm text-muted-foreground">-</div>
      
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return <div className="text-sm text-muted-foreground">-</div>
      
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "PPp", { locale: fr })}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original

      return (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              // This will be handled by the row click in DataTable
            }}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
        </div>
      )
    },
  },
]
