"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyOrdersState,
  LoadingOrdersState,
  ErrorOrdersState
} from "./AdminCmdClientStates"
import { AdminCmdClientContent } from "./AdminCmdClientContent"
import { useAdminCmdClientLogic } from "@/hooks/commandes/cmdClient/useAdminCmdClientLogic"

export function AdminCmdClient() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    ordersData,
    displayData,
    stats,
    orders,
    isLoading,
    isError,
    currentPage,
    selectedOrders,
    isCreateModalOpen,
    editingOrder,
    setIsCreateModalOpen,
    setFilteredOrders,
    setHasFilter,
    handleEditOrder,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingOrder,
    handleDelete,
    handleUpdateStatus,
    handleCancel,
    handleBulkDelete,
    handleBulkUpdateStatus,
    handleBulkCancel,
    handleFormSubmit,
    isFormLoading
  } = useAdminCmdClientLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && ordersData.length === 0) return <EmptyOrdersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingOrdersState />
  if (isError) return <ErrorOrdersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminCmdClientContent
      currentUser={currentUser}
      ordersData={ordersData}
      displayData={displayData}
      stats={stats}
      orders={orders}
      currentPage={currentPage}
      selectedOrders={selectedOrders}
      isCreateModalOpen={isCreateModalOpen}
      editingOrder={editingOrder}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredOrders={setFilteredOrders}
      setHasFilter={setHasFilter}
      handleEditOrder={handleEditOrder}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setCurrentPage={setCurrentPage}
      setEditingOrder={setEditingOrder}
      handleDelete={handleDelete}
      handleUpdateStatus={handleUpdateStatus}
      handleCancel={handleCancel}
      handleBulkDelete={handleBulkDelete}
      handleBulkUpdateStatus={handleBulkUpdateStatus}
      handleBulkCancel={handleBulkCancel}
      handleFormSubmit={handleFormSubmit}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
    />
  )
}