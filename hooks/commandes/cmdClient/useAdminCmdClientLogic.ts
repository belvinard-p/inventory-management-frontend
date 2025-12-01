"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { clientOrderService } from "@/service/client/clientOrderService"
import { clientService } from "@/service/client/clientService"
import type { ClientOrderResponse, ClientOrderRequest, OrderStatus } from "@/types/client/clientOrder"
import { calculateClientOrderStats } from "@/lib/orderStatusUtils"
import { toast } from "sonner"

export function useAdminCmdClientLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ClientOrderResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<ClientOrderResponse[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<ClientOrderResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

  const queryClient = useQueryClient()

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["clientOrders", currentPage, pageSize],
    queryFn: async () => {
      const orders = await clientOrderService.getAllOrders()

      const uniqueClientIds = [...new Set(orders.map((o: any) => o.clientId))]
      const clientNames = await Promise.all(
        uniqueClientIds.map(async (clientId: number) => {
          const client = await clientService.getById(clientId)
          return { id: clientId, name: client.name }
        })
      )

      const clientNameMap = new Map(clientNames.map(c => [c.id, c.name]))

      return orders.map((order: any) => ({
        ...order,
        clientName: clientNameMap.get(order.clientId)
      }))
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken
  })

  const ordersData = Array.isArray(orders) ? orders : []
  const allFilteredData = hasFilter ? filteredOrders : ordersData

  const totalPages = Math.ceil(allFilteredData.length / pageSize)
  const displayData = allFilteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0)
    }
  }, [totalPages, currentPage])

  const createMutation = useMutation({
    mutationFn: (data: ClientOrderRequest) => clientOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande créée avec succès")
      setIsCreateModalOpen(false)
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la commande", { description: error.message })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientOrderRequest }) =>
      clientOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande mise à jour avec succès")
      setEditingOrder(null)
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la commande", { description: error.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande supprimée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de la commande", { description: error.message })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      clientOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Statut mis à jour avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du statut", { description: error.message })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => clientOrderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande annulée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation de la commande", { description: error.message })
    },
  })

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingOrder) setEditingOrder(null)
    }
  })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (ordersData.length > 0 && filteredOrders.length === 0 && !hasFilter) {
      setFilteredOrders(ordersData)
    }
  }, [ordersData, filteredOrders.length, hasFilter])

  const handleEditOrder = (order: ClientOrderResponse) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingOrder(order)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedOrders(selected)
  }

  const clearSelection = () => setSelectedOrders([])

  const stats = useMemo(() => {
    if (!ordersData || ordersData.length === 0) {
      return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    }
    return calculateClientOrderStats(ordersData)
  }, [ordersData])

  const handleFormSubmit = async (data: ClientOrderRequest) => {
    if (editingOrder) {
      await updateMutation.mutateAsync({ id: editingOrder.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }
  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }
  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ id, status })
  }

  const handleCancel = async (id: number) => {
    await cancelMutation.mutateAsync(id)
  }

  const handleBulkDelete = async (ids: number[]) => {
    for (const id of ids) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleBulkUpdateStatus = async (ids: number[], status: OrderStatus) => {
    for (const id of ids) {
      await updateStatusMutation.mutateAsync({ id, status })
    }
  }

  const handleBulkCancel = async (ids: number[]) => {
    for (const id of ids) {
      await cancelMutation.mutateAsync(id)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    ordersData,
    displayData,
    stats,
    orders: { totalPages, totalElements: allFilteredData.length },
    isLoading: isLoading || deleteMutation.isPending || updateStatusMutation.isPending || cancelMutation.isPending,
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
    isFormLoading: createMutation.isPending || updateMutation.isPending
  }
}
