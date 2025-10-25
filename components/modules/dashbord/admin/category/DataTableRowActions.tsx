"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import { AlertModal } from "@/components/global/alert-modal"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (row: TData) => void
  onDelete?: (id: string) => Promise<void>
  viewPath?: string
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  viewPath,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      if (onDelete) {
        await onDelete((row.original as any).id)
      }
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Edit
            </DropdownMenuItem>
          )}
          {viewPath && (
            <DropdownMenuItem
              onClick={() => router.push(`${viewPath}/${(row.original as any).id}`)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              View Details
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
