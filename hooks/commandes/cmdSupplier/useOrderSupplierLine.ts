"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderSupplierLineService } from "@/service/supplier/orderSupplierLineService"
import { toast } from "sonner"
import type { SupplierOrderLineRequest } from "@/types/supplier/supplierOrderLine"
import { OrderSupplierLinesCacheKeys } from "@/lib/const"

export const useOrderSupplierLines = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: SupplierOrderLineRequest) => orderSupplierLineService.create(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines] })
      queryClient.invalidateQueries({
        queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines, 'order', variables.supplierOrderId]
      })
      queryClient.invalidateQueries({
        queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines, 'order', variables.supplierOrderId, 'total']
      })
      queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
      toast.success("Ligne de commande créée avec succès")
      return data
    },
    onError: () => {
      toast.error("Erreur lors de la création")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => {
      return orderSupplierLineService.updateLineQuantity(id, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines] })
      queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
      toast.success("Ligne de commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderSupplierLineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines] })
      queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
      toast.success("Ligne de commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  return {
    createOrderSupplierLine: createMutation.mutate,
    createOrderSupplierLineAsync: createMutation.mutateAsync,
    updateOrderSupplierLine: updateMutation.mutate,
    deleteOrderSupplierLine: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useOrderSupplierLine = (id?: number) => {
  const queryClient = useQueryClient()

  const lineQuery = useQuery({
    queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLine, id],
    queryFn: () => orderSupplierLineService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: (quantity: number) => {
      if (!id) throw new Error("ID requis")
      return orderSupplierLineService.updateLineQuantity(id, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLine, id] })
      }
      toast.success("Ligne de commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return orderSupplierLineService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines] })
      toast.success("Ligne de commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  return {
    line: lineQuery.data,
    isLoading: lineQuery.isLoading,
    isError: lineQuery.isError,
    error: lineQuery.error,
    refetch: lineQuery.refetch,

    updateOrderSupplierLine: updateMutation.mutate,
    deleteOrderSupplierLine: deleteMutation.mutate,

    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useOrderSupplierLinesByOrder = (supplierOrderId?: number) => {
  const linesQuery = useQuery({
    queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines, 'order', supplierOrderId],
    queryFn: () => orderSupplierLineService.getAllLinesForOrder(supplierOrderId!),
    enabled: !!supplierOrderId,
    staleTime: 5 * 60 * 1000,
  })

  const totalQuery = useQuery({
    queryKey: [OrderSupplierLinesCacheKeys.OrderSupplierLines, 'order', supplierOrderId, 'total'],
    queryFn: () => orderSupplierLineService.calculateTotal(supplierOrderId!),
    enabled: !!supplierOrderId,
    staleTime: 5 * 60 * 1000,
  })

  return {
    lines: linesQuery.data,
    isLoading: linesQuery.isLoading,
    isError: linesQuery.isError,
    error: linesQuery.error,
    refetch: linesQuery.refetch,

    total: totalQuery.data,
    isLoadingTotal: totalQuery.isLoading,
    refetchTotal: totalQuery.refetch,
  }
}