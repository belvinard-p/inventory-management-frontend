"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { clientOrderService } from "@/service/client/clientOrderService"
import type { ClientOrderResponse, ClientOrderRequest, OrderStatus } from "@/types/client/clientOrder"
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

  // Fetch all orders
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["clientOrders", currentPage, pageSize],
    queryFn: () => clientOrderService.getAllOrders(),
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken
  })

  const ordersData = Array.isArray(orders) ? orders : []
  const displayData = hasFilter ? filteredOrders : ordersData

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ClientOrderRequest) => clientOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande créée avec succès")
      setIsCreateModalOpen(false)
    },
    onError: () => {
      toast.error("Erreur lors de la création de la commande")
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientOrderRequest }) =>
      clientOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande mise à jour avec succès")
      setEditingOrder(null)
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la commande")
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la commande")
    },
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      clientOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Statut mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut")
    },
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => clientOrderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande annulée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la commande")
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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = ordersData.length
    const pending = ordersData.filter((o) => o.stateOrder === "PENDING").length
    const confirmed = ordersData.filter((o) => o.stateOrder === "CONFIRMED").length
    const completed = ordersData.filter((o) => o.stateOrder === "COMPLETED").length

    return { total, pending, confirmed, completed }
  }, [ordersData])

  // Handle form submit
  const handleFormSubmit = async (data: ClientOrderRequest) => {
    if (editingOrder) {
      await updateMutation.mutateAsync({ id: editingOrder.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  // Handle update status
  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ id, status })
  }

  // Handle cancel
  const handleCancel = async (id: number) => {
    await cancelMutation.mutateAsync(id)
  }

  // Bulk operations
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
    orders: { totalPages: 1, totalElements: ordersData.length }, // Simplified pagination
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
