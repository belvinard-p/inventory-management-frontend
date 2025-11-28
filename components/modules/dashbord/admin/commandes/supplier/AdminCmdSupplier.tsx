"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyOrdersState,
  LoadingOrdersState,
  ErrorOrdersState
} from "./AdminCmdSupplierStates"
import { AdminCmdSupplierContent } from "./AdminCmdSupplierContent"
import { useAdminCmdSupplierLogic } from "@/hooks/commandes/cmdSupplier/useAdminCmdSupplierLogic"

export function AdminCmdSupplier() {
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
    currentPage,
    selectedOrders,
    isLoading,
    isError,
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
  } = useAdminCmdSupplierLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (isLoading) return <LoadingOrdersState />
  if (isError) return <ErrorOrdersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (!isLoading && !isError && ordersData?.length === 0) return <EmptyOrdersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminCmdSupplierContent
      currentUser={currentUser}
      ordersData={ordersData}
      displayData={displayData}
      stats={stats}
      orders={orders}
      currentPage={currentPage}
      selectedOrders={selectedOrders}
      isLoading={isLoading}
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
      isFormLoading={isFormLoading}
    />
  )
}