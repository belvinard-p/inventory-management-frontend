"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { ClientResponse } from "@/types/client/client"
import { toast } from "sonner"

export function useAdminClientLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredClients, setFilteredClients] = useState<ClientResponse[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedClients, setSelectedClients] = useState<ClientResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  const { data: clients, isLoading, isError } = useQuery<{
    content: ClientResponse[]
    totalElements: number
    totalPages: number
    size: number
    number: number
  }>({
    queryKey: ['clients', currentPage, pageSize],
    queryFn: () => apiClient.get(`/clients/all?pageNumber=${currentPage}&pageSize=${pageSize}`),
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken
  })
  const clientsData = Array.isArray(clients?.content) ? clients.content : []
  const displayData = hasFilter ? filteredClients : clientsData

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingClient) setEditingClient(null)
    }
  })

  useEffect(() => setMounted(true), [])
  
  useEffect(() => {
    if (clientsData.length > 0 && filteredClients.length === 0 && !hasFilter) {
      setFilteredClients(clientsData)
    }
  }, [clientsData, filteredClients.length, hasFilter])

  const handleEditClient = (client: ClientResponse) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingClient(client)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedClients(selected)
  }

  const clearSelection = () => setSelectedClients([])

  const stats = {
    total: clients?.totalElements ?? clientsData.length,
    withOrders: clientsData.filter(c => c.orders && c.orders.length > 0)?.length || 0,
    withoutOrders: clientsData.filter(c => !c.orders || c.orders.length === 0)?.length || 0,
    withAddress: clientsData.filter(c => c.address && (c.address.address1 || c.address.city))?.length || 0,
    withoutAddress: clientsData.filter(c => !c.address || (!c.address.address1 && !c.address.city))?.length || 0,
  }

  return {
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
  }
}