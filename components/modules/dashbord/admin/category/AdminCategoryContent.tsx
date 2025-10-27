"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "./DataTable"
import { CategoryResponse } from "@/types/category"
import { createColumns } from "./Columns"
import { CategoryForm } from "./CategoryForm"
import { DeleteConfirmDialog } from "@/components/global/DeleteConfirmDialog"
import { useCategories } from "@/hooks/category/useCategory"

interface AdminCategoryContentProps {
  categories: CategoryResponse[]
  hasPermission: boolean
  isAuthenticated: boolean
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
}

export function AdminCategoryContent({
  categories,
  hasPermission,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: AdminCategoryContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryResponse | undefined>()
  const { deleteCategory, isDeleting } = useCategories()

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDelete = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory.mutateAsync(selectedCategory.id)
        setIsDeleteDialogOpen(false)
        setSelectedCategory(undefined)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const columns = createColumns({ onEdit: handleEdit, onDelete: handleDelete })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de produits et leurs informations
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Catégorie
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={categories}
      />

      <CategoryForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />

      <CategoryForm
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        category={selectedCategory}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedCategory?.designation}
        isLoading={isDeleting}
      />
    </div>
  )
}