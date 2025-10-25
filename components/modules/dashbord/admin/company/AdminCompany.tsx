"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyCompaniesState,
  LoadingCompaniesState,
  ErrorCompaniesState
} from "./AdminCompanyStates"
import { AdminCompanyContent } from "./AdminCompanyContent"
import { useAdminCompanyLogic } from "@/hooks/useAdminCompanyLogic"

export function AdminCompany() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    companiesData,
    displayData,
    stats,
    companies,
    isLoading,
    isError,
    currentPage,
    selectedCompanies,
    isCreateModalOpen,
    editingCompany,
    setIsCreateModalOpen,
    setFilteredCompanies,
    setHasFilter,
    handleEditCompany,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingCompany
  } = useAdminCompanyLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && companiesData.length === 0) return <EmptyCompaniesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingCompaniesState />
  if (isError) return <ErrorCompaniesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminCompanyContent
      currentUser={currentUser}
      companiesData={companiesData}
      displayData={displayData}
      stats={stats}
      companies={companies}
      currentPage={currentPage}
      selectedCompanies={selectedCompanies}
      isCreateModalOpen={isCreateModalOpen}
      editingCompany={editingCompany}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredCompanies={setFilteredCompanies}
      setHasFilter={setHasFilter}
      handleEditCompany={handleEditCompany}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setCurrentPage={setCurrentPage}
      setEditingCompany={setEditingCompany}
    />
  )
}