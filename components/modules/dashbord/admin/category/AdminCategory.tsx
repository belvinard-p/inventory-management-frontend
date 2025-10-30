"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyState,
  LoadingState,
  ErrorState
} from "./AdminCategoryStates"
import { AdminCategoryContent } from "./AdminCategoryContent"
import { useAdminCategoryLogic } from "@/hooks/category/useAdminCategoryLogic"

export function AdminCategory() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    categoriesData,
    displayData,
    isLoading,
    isError,
    currentPage,
    isCreateModalOpen,
    setIsCreateModalOpen,
    setCurrentPage,
  } = useAdminCategoryLogic()

  const handleRetry = () => window.location.reload()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} onRetry={handleRetry} />
  if (!isLoading && !isError && categoriesData?.content?.length === 0) return <EmptyState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminCategoryContent
      categories={displayData}
      hasPermission={hasPermission}
      isAuthenticated={isAuthenticated}
      isCreateModalOpen={isCreateModalOpen}
      setIsCreateModalOpen={setIsCreateModalOpen}
    />
  )
}

export default AdminCategory