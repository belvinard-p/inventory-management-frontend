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

  console.log('AdminClient render conditions:', {
    mounted,
    authLoading,
    isAuthenticated,
    currentUser: !!currentUser,
    hasPermission,
    isLoading,
    isError,
    clientsDataLength: clientsData.length
  })

  if (!mounted || authLoading) {
    console.log('Returning LoadingSpinner - mounted:', mounted, 'authLoading:', authLoading)
    return <LoadingSpinner />
  }
  if (!isAuthenticated || !currentUser) {
    console.log('Returning AuthErrorState - isAuthenticated:', isAuthenticated, 'currentUser:', !!currentUser)
    return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  }
  if (!hasPermission) {
    console.log('Returning AuthErrorState - hasPermission:', hasPermission)
    return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  }
  if (!isLoading && !isError && clientsData.length === 0) {
    console.log('Returning EmptyClientsState - isLoading:', isLoading, 'isError:', isError, 'clientsData.length:', clientsData.length)
    return <EmptyClientsState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  }
  if (isLoading) {
    console.log('Returning LoadingClientsState - isLoading:', isLoading)
    return <LoadingClientsState />
  }
  if (isError) {
    console.log('Returning ErrorClientsState - isError:', isError)
    return <ErrorClientsState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  }

  console.log('Rendering AdminClientContent!')

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