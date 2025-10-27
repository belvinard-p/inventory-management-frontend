import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { CategoryResponse } from "@/types/category"

interface ColumnsProps {
  onEdit: (category: CategoryResponse) => void
}

export const createColumns = ({ onEdit }: ColumnsProps): ColumnDef<CategoryResponse>[] => [
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(category)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implement delete functionality
                console.log('Delete category:', category)
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]