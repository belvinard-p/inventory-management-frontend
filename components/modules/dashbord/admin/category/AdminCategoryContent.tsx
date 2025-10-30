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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const { deleteCategory, isDeleting } = useCategories()

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDelete = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleDetails = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsDetailsDialogOpen(true)
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

  const columns = createColumns({ onEdit: handleEdit, onDelete: handleDelete, onDetails: handleDetails })
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

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la catégorie</DialogTitle>
            <DialogDescription>Cliquez en dehors du dialogue pour fermer.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-2 py-2 text-base">
              <div><strong>Code:</strong> {selectedCategory.code}</div>
              <div><strong>Désignation:</strong> {selectedCategory.designation}</div>
              <div><strong>Date de création:</strong> {selectedCategory.createdDate ? format(new Date(selectedCategory.createdDate), "PP", { locale: fr }) : "-"}</div>
              <div><strong>Dernière mise à jour:</strong> {selectedCategory.updatedDate ? format(new Date(selectedCategory.updatedDate), "PP", { locale: fr }) : "-"}</div>
              {/* Ajoutez d'autres champs au besoin */}
            </div>
          )}
        </DialogContent>
      </Dialog>

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