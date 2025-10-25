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
import { useCategories } from "@/hooks/category/useCategory"
import { CategoryResponse } from "@/types/category"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export function AdminCategory() {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryResponse | null>(null)
  const [hasFilter, setHasFilter] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const router = useRouter()
  
  // Get authenticated user
  const { user: currentUser, isAuthenticated } = useAuth()
  const hasPermission = currentUser?.roleName === 'ADMIN' // Adjust based on your permission logic

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Get categories with pagination
  const { 
    getCategories: { 
      data: categoriesData = { content: [], totalElements: 0, totalPages: 0 }, 
      isLoading, 
      isError 
    } 
  } = useCategories(
    currentPage - 1, 
    10, 
    currentUser?.companyId || 0
  )

  // Check if component is mounted to prevent hydration issues
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Filter categories based on search/filter criteria
  const [filteredCategories, setFilteredCategories] = React.useState<CategoryResponse[]>([])
  
  // Update filtered categories when categories data changes
  React.useEffect(() => {
    if (categoriesData?.content) {
      setFilteredCategories(categoriesData.content)
    }
  }, [categoriesData])

  const handleEditCategory = (category: CategoryResponse) => {
    setEditingCategory(category)
    setIsCreateModalOpen(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    // Implement delete logic here
    console.log('Delete category:', categoryId)
  }

  const handleRetry = () => {
    // Implement retry logic here
    window.location.reload()
  }

  // Show loading state while checking auth
  if (!mounted || (isAuthenticated === undefined)) {
    return <LoadingSpinner />
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthErrorState 
        title="Authentication Error" 
        description="You need to be authenticated to access this page." 
      />
    )
  }

  // Show loading state while fetching data
  if (isLoading) {
    return <LoadingCategoriesState />
  }

  // Show error state if there was an error
  if (isError) {
    // If user is not authenticated, show auth error
    if (!currentUser) {
      return (
        <AuthErrorState 
          title="Non autorisé"
          description="Veuillez vous connecter pour accéder à cette page." 
        />
      )
    }
    
    return (
      <ErrorCategoriesState 
        currentUser={currentUser}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        onRetry={handleRetry}
      />
    )
  }

  // Show empty state if no categories found
  if (categoriesData.content.length === 0 && !hasFilter) {
    return (
      <EmptyCategoriesState 
        currentUser={currentUser}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
      />
    )
  }

  return (
    <AdminCategoryContent
      categories={filteredCategories}
      totalItems={categoriesData.totalElements}
      currentPage={currentPage}
      totalPages={categoriesData.totalPages}
      onPageChange={setCurrentPage}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onCreateCategory={() => setIsCreateModalOpen(true)}
      hasPermission={hasPermission}
      isAuthenticated={isAuthenticated}
      hasFilter={hasFilter}
    />
  )
}

export default AdminCategory