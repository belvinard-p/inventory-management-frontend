"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyClientsState,
  LoadingClientsState,
  ErrorClientsState
} from "./AdminClientStates"
import { AdminClientContent } from "./AdminClientContent"
import { useAdminClientLogic } from "@/hooks/client/useAdminClientLogic"

export function AdminClient() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    clientsData,
    displayData,
    stats,
    clients,
    isLoading,
    isError,
    currentPage,
    selectedClients,
    isCreateModalOpen,
    editingClient,
    setIsCreateModalOpen,
    setFilteredClients,
    setHasFilter,
    handleEditClient,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingClient
  } = useAdminClientLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && clientsData.length === 0) return <EmptyClientsState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingClientsState />
  if (isError) return <ErrorClientsState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <AdminClientContent
      currentUser={currentUser}
      clientsData={clientsData}
      displayData={displayData}
      stats={stats}
      clients={clients}
      currentPage={currentPage}
      selectedClients={selectedClients}
      isCreateModalOpen={isCreateModalOpen}
      editingClient={editingClient}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredClients={setFilteredClients}
      setHasFilter={setHasFilter}
      handleEditClient={handleEditClient}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setCurrentPage={setCurrentPage}
      setEditingClient={setEditingClient}
    />
  )
}