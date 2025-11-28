"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { supplierOrderService } from "@/service/supplier/supplierOrderService"
import { SupplierOrder, SupplierOrderRequest, OrderStatus } from "@/types/supplier/supplierOrder"
import { SupplierOrdersCacheKeys } from "@/lib/const"
import { calculateOrderStats } from "@/lib/orderStatusUtils"
import { toast } from "sonner"

export function useAdminCmdSupplierLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<SupplierOrder | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<SupplierOrder[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<SupplierOrder[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  const queryClient = useQueryClient()

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: [SupplierOrdersCacheKeys.SupplierOrders, currentPage, pageSize],
    queryFn: async () => {
      const orders = await supplierOrderService.getAllOrders()
      
      const validSupplierIds = [...new Set(orders.map((o: any) => o.supplierId).filter(id => id != null && id !== undefined))]
      
      if (validSupplierIds.length === 0) {
        return orders.map((order: any) => ({ ...order, supplierName: null }))
      }
      
      const { supplierService } = await import("@/service/supplier/supplierService")
      const supplierNames = await Promise.all(
        validSupplierIds.map(async (supplierId: number) => {
          try {
            const supplier = await supplierService.getById(supplierId)
            return { id: supplierId, name: supplier.name }
          } catch {
            return { id: supplierId, name: null }
          }
        })
      )
      
      const supplierNameMap = new Map(supplierNames.map(s => [s.id, s.name]))
      
      return orders.map((order: any) => ({
        ...order,
        supplierName: supplierNameMap.get(order.supplierId)
      }))
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  const ordersData = Array.isArray(orders) ? orders : []
  const displayData = hasFilter ? filteredOrders : ordersData

  const createMutation = useMutation({
    mutationFn: (data: SupplierOrderRequest) => supplierOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande créée avec succès")
      setIsCreateModalOpen(false)
    },
    onError: () => {
      toast.error("Erreur lors de la création de la commande")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierOrderRequest }) =>
      supplierOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande mise à jour avec succès")
      setEditingOrder(null)
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la commande")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la commande")
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      supplierOrderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Statut mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut")
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => supplierOrderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
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

  const handleEditOrder = (order: SupplierOrder) => {
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
    return calculateOrderStats(ordersData)
  }, [ordersData])

  const handleFormSubmit = async (data: SupplierOrderRequest) => {
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
    orders: { totalPages: 1, totalElements: ordersData.length },
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