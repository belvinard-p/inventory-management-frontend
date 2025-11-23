"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderClientLineService } from "@/service/client/orderClientLineService"
import { toast } from "sonner"
import type { OrderClientLineRequest } from "@/types/client/orderClientLine"
import { OrderClientLinesCacheKeys } from "@/lib/const"

// Hook for creating, updating, and deleting order client lines
export const useOrderClientLines = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: OrderClientLineRequest) => orderClientLineService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Ligne de commande créée avec succès")
      return data
    },
    onError: () => {
      toast.error("Erreur lors de la création")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => {
      return orderClientLineService.updateLineQuantity(id, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Ligne de commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => orderClientLineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Ligne de commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  return {
    createOrderClientLine: createMutation.mutate,
    createOrderClientLineAsync: createMutation.mutateAsync,
    updateOrderClientLine: updateMutation.mutate,
    deleteOrderClientLine: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

// Hook for fetching a single order client line
export const useOrderClientLine = (id?: number) => {
  const queryClient = useQueryClient()

  const lineQuery = useQuery({
    queryKey: [OrderClientLinesCacheKeys.OrderClientLine, id],
    queryFn: () => orderClientLineService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: (quantity: number) => {
      if (!id) throw new Error("ID requis")
      return orderClientLineService.updateLineQuantity(id, quantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLine, id] })
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
      return orderClientLineService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
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

    updateOrderClientLine: updateMutation.mutate,
    deleteOrderClientLine: deleteMutation.mutate,

    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

// Hook for fetching all lines for a specific order
export const useOrderClientLinesByOrder = (clientOrderId?: number) => {
  const queryClient = useQueryClient()

  const linesQuery = useQuery({
    queryKey: [OrderClientLinesCacheKeys.OrderClientLines, 'order', clientOrderId],
    queryFn: () => orderClientLineService.getAllLinesForOrder(clientOrderId!),
    enabled: !!clientOrderId,
    staleTime: 5 * 60 * 1000,
  })

  const totalQuery = useQuery({
    queryKey: [OrderClientLinesCacheKeys.OrderClientLines, 'order', clientOrderId, 'total'],
    queryFn: () => orderClientLineService.calculateTotal(clientOrderId!),
    enabled: !!clientOrderId,
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