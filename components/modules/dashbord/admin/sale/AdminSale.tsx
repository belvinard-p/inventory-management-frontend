"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptySalesState,
  LoadingSalesState,
  ErrorSalesState
} from "./AdminSaleStates"
import { AdminSaleContent } from "./AdminSaleContent"
import { useAdminSaleLogic } from "@/hooks/useAdminSaleLogic"

export function AdminSale() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    salesData,
    displayData,
    stats,
    sales,
    isLoading,
    isError,
    currentPage,
    selectedSales,
    isCreateModalOpen,
    editingSale,
    selectedSale,
    setIsCreateModalOpen,
    setFilteredSales,
    setHasFilter,
    handleEditSale,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingSale,
    setSelectedSale,
    handleDelete,
    handleUpdateStatus,
    handleCancel,
    handleBulkDelete,
    handleBulkUpdateStatus,
    handleBulkCancel,
    handleFormSubmit,
    handleSaleUpdate,
    isFormLoading
  } = useAdminSaleLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && salesData.length === 0) return <EmptySalesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingSalesState />
  if (isError) return <ErrorSalesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminSaleContent
      currentUser={currentUser}
      salesData={salesData}
      displayData={displayData}
      stats={stats}
      sales={sales}
      currentPage={currentPage}
      selectedSales={selectedSales}
      isCreateModalOpen={isCreateModalOpen}
      editingSale={editingSale}
      selectedSale={selectedSale}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredSales={setFilteredSales}
      setHasFilter={setHasFilter}
      handleEditSale={handleEditSale}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setCurrentPage={setCurrentPage}
      setEditingSale={setEditingSale}
      setSelectedSale={setSelectedSale}
      handleDelete={handleDelete}
      handleUpdateStatus={handleUpdateStatus}
      handleCancel={handleCancel}
      handleBulkDelete={handleBulkDelete}
      handleBulkUpdateStatus={handleBulkUpdateStatus}
      handleBulkCancel={handleBulkCancel}
      handleFormSubmit={handleFormSubmit}
      handleSaleUpdate={handleSaleUpdate}
      isLoading={isLoading}
      isFormLoading={isFormLoading}
    />
  )
}