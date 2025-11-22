"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyLinesState,
  LoadingLinesState,
  ErrorLinesState
} from "./AdminClientLineStates"
import { AdminClientLineContent } from "./AdminClientLineContent"
import { useAdminAllCmdClientLinesLogic } from "@/hooks/commandes/cmdClient/useAdminAllCmdClientLinesLogic"

export function AdminAllCmdClientLines() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    linesData,
    displayData,
    stats,
    isLoading,
    isError,
    selectedLines,
    isCreateModalOpen,
    editingLine,
    setIsCreateModalOpen,
    setFilteredLines,
    setHasFilter,
    handleEditLine,
    handleRowSelectionChange,
    clearSelection,
    setEditingLine,
    handleDelete,
    handleUpdateQuantity,
    handleBulkDelete,
  } = useAdminAllCmdClientLinesLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && linesData.length === 0) return <EmptyLinesState hasPermission={hasPermission} />
  if (isLoading) return <LoadingLinesState />
  if (isError) return <ErrorLinesState />

  return (
    <AdminClientLineContent
      currentUser={currentUser}
      linesData={linesData}
      displayData={displayData}
      stats={stats}
      selectedLines={selectedLines}
      isCreateModalOpen={isCreateModalOpen}
      editingLine={editingLine}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredLines={setFilteredLines}
      setHasFilter={setHasFilter}
      handleEditLine={handleEditLine}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setEditingLine={setEditingLine}
      handleDelete={handleDelete}
      handleUpdateQuantity={handleUpdateQuantity}
      handleBulkDelete={handleBulkDelete}
      isLoading={isLoading}
    />
  )
}
