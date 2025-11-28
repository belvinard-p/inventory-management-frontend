"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { supplierOrderService } from "@/service/supplier/supplierOrderService"
import { SupplierOrder, SupplierOrderRequest, OrderStatus } from "@/types/supplier/supplierOrder"
import { SupplierOrdersCacheKeys } from "@/lib/const"
import { toast } from "sonner"

export const useSupplierOrders = () => {
  return useQuery({
    queryKey: [SupplierOrdersCacheKeys.SupplierOrders, "all"],
    queryFn: () => supplierOrderService.getAllOrders(),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== "undefined",
  })
}

export const useSupplierOrder = (id?: number) => {
  const queryClient = useQueryClient()
  
  const orderQuery = useQuery({
    queryKey: [SupplierOrdersCacheKeys.SupplierOrder, id],
    queryFn: () => supplierOrderService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: SupplierOrderRequest) => {
      if (!id) throw new Error("ID requis")
      return supplierOrderService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrder, id] })
      toast.success("Commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return supplierOrderService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!id) throw new Error("ID requis")
      return supplierOrderService.updateOrderStatus(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrder, id] })
      toast.success("Statut mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut")
    }
  })

  const cancelOrderMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return supplierOrderService.cancelOrder(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrder, id] })
      toast.success("Commande annulée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation")
    }
  })
  
  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
    refetch: orderQuery.refetch,
    
    updateSupplierOrder: updateMutation.mutate,
    deleteSupplierOrder: deleteMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    statusError: updateStatusMutation.error,
    cancelError: cancelOrderMutation.error,
  }
}

export const useCreateSupplierOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SupplierOrderRequest) => 
      supplierOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande créée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la création")
    }
  })
}

export const useUpdateSupplierOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SupplierOrderRequest }) => 
      supplierOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande modifiée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la modification")
    }
  })
}

export const useDeleteSupplierOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => 
      supplierOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })
}