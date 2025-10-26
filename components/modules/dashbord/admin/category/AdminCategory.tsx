"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyState as EmptyCategoriesState,
  LoadingState as LoadingCategoriesState,
  ErrorState as ErrorCategoriesState
} from "./AdminCategoryStates"
import { AdminCategoryContent } from "./AdminCategoryContent"
import { useAdminCategoryLogic } from "@/hooks/category/useAdminCategoryLogic"
import { useCategories } from "@/hooks/category/useCategory"
import { CategoryForm } from "./CategoryForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function AdminCategory() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    categoriesData,
    displayData,
    stats,
    isLoading,
    isError,
    currentPage,
    selectedCategories,
    isCreateModalOpen,
    editingCategory,
    setIsCreateModalOpen,
    setFilteredCategories,
    setHasFilter,
    handleEditCategory,
    handleDeleteCategory,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingCategory
  } = useAdminCategoryLogic()
  
  const { createCategory } = useCategories()

  const handleRetry = () => window.location.reload()

  console.log('AdminCategory render:', { mounted, authLoading, isAuthenticated, hasPermission, isLoading, isError, categoriesData })
  
  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  // Always show the main content, even if categories list is empty
  // if (!isLoading && !isError && categoriesData?.content?.length === 0) return <EmptyCategoriesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingCategoriesState />
  if (isError) return <ErrorCategoriesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} onRetry={handleRetry} />

  return (
    <>
      <AdminCategoryContent
        categories={displayData}
        totalItems={categoriesData?.totalElements || 0}
        currentPage={currentPage + 1}
        totalPages={categoriesData?.totalPages || 0}
        onPageChange={(page) => setCurrentPage(page - 1)}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onCreateCategory={() => {
        console.log('Create category clicked')
        setIsCreateModalOpen(true)
      }}
        hasPermission={hasPermission}
        isAuthenticated={isAuthenticated}
        hasFilter={false}
      />
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={async (values) => {
              try {
                await createCategory.mutateAsync(values)
                setIsCreateModalOpen(false)
              } catch (error) {
                console.error('Error creating category:', error)
              }
            }}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={createCategory.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminCategory