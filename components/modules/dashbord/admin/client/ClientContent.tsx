"use client"

import React from "react"
import { AdminClientContent } from "./AdminClientContent"
import { useAdminClientLogic } from "@/hooks/client/useAdminClientLogic"

export function ClientContent() {
  const {
    currentUser,
    clientsData,
    displayData,
    stats,
    clients,
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