"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Category } from "@/types/category"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Pencil, X } from "lucide-react"
import { CategoryForm } from "./CategoryForm"

interface CategoryDetailsDialogProps {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (category: Category) => Promise<void>
  isSaving: boolean
}

export function CategoryDetailsDialog({
  category,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: CategoryDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async (values: any) => {
    await onSave({ ...category, ...values })
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              {isEditing ? "Edit Category" : "Category Details"}
            </DialogTitle>
            <div className="flex space-x-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {isEditing ? (
          <CategoryForm
            category={category}
            onSubmit={handleSave}
            onCancel={() => setIsEditing(false)}
            isSubmitting={isSaving}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Slug: {category.slug}
                </span>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            {category.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Created At</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(category.createdAt), "PPpp")}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Updated At</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(category.updatedAt), "PPpp")}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
