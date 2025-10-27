import { ColumnDef } from "@tanstack/react-table"
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
]