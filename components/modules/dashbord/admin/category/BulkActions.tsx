"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Check, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface BulkActionsProps {
  selectedIds: string[]
  onDelete: (ids: string[]) => Promise<void>
  onStatusChange: (ids: string[], isActive: boolean) => Promise<void>
  disabled?: boolean
}

export function BulkActions({
  selectedIds,
  onDelete,
  onStatusChange,
  disabled = false,
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState<"delete" | "activate" | "deactivate" | null>(null)

  const handleAction = async (action: () => Promise<void>, type: "delete" | "activate" | "deactivate") => {
    try {
      setIsLoading(type)
      await action()
      toast({
        title: "Success",
        description: `Selected categories have been ${type === 'delete' ? 'deleted' : type === 'activate' ? 'activated' : 'deactivated'}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${type} categories. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuItem
            onClick={() => 
              handleAction(
                () => onStatusChange(selectedIds, true),
                "activate"
              )
            }
            disabled={isLoading === "activate" || disabled}
          >
            {isLoading === "activate" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => 
              handleAction(
                () => onStatusChange(selectedIds, false),
                "deactivate"
              )
            }
            disabled={isLoading === "deactivate" || disabled}
          >
            {isLoading === "deactivate" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Deactivate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => 
              handleAction(
                () => onDelete(selectedIds),
                "delete"
              )
            }
            disabled={isLoading === "delete" || disabled}
            className="text-destructive focus:text-destructive"
          >
            {isLoading === "delete" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
