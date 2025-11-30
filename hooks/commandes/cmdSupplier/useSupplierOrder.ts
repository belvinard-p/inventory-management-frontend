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
      toast.success("Commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  return { orderQuery, updateMutation }
}

export const useCreateSupplierOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SupplierOrderRequest) => supplierOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande créée avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création")
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
      toast.success("Commande mise à jour avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  })
}

export const useDeleteSupplierOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => supplierOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SupplierOrdersCacheKeys.SupplierOrders] })
      toast.success("Commande supprimée avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression")
    }
  })
}