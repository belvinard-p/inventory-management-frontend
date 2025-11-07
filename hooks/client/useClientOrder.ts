import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { clientOrderService } from '@/service/client/clientOrderService'
import { ClientOrderResponse, ClientOrderRequest, OrderStatus } from '@/types/client/clientOrder'
import { ApiError } from '@/types'
import { ClientOrdersCacheKeys } from '@/lib/const'

export const useClientOrders = () => {
  const queryClient = useQueryClient()

  const getAllOrders = useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'all'],
    queryFn: async () => {
      console.log('Fetching all client orders...')
      try {
        const result = await clientOrderService.getAllOrders()
        console.log('Client orders fetched successfully:', result)
        return result
      } catch (error) {
        console.error('Error fetching client orders:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: typeof window !== 'undefined',
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000
  })

  const createClientOrder = useMutation({
    mutationFn: (data: ClientOrderRequest) => clientOrderService.create(data),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      enhancedToast.success("Commande créée avec succès", {
        description: `Commande ${newOrder.code} a été créée`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de', newOrder.code)
        }
      })
    },
    onError: async (error: any) => {
      console.error('Erreur création commande:', error)
      
      if (error?.details?.status === 409 || error?.message?.includes('409')) {
        const conflictMessage = error?.details?.message || error?.details?.errors?.error || "Une commande avec ce code existe déjà"
        toast.error("Conflit", { description: conflictMessage })
        return
      }
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création de la commande"
      toast.error("Erreur de création", { description: message })
    }
  })

  const updateClientOrder = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientOrderRequest }) => 
      clientOrderService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, variables.id] })
      toast.success("Commande mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteClientOrder = useMutation({
    mutationFn: (id: number) => clientOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      enhancedToast.actionWithUndo("Commande supprimée", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "La commande a été supprimée"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "La commande n'a pas pu être supprimée",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
    }
  })

  return {
    orders: getAllOrders.data,
    isLoading: getAllOrders.isLoading,
    isError: getAllOrders.isError,
    error: getAllOrders.error,
    refetch: getAllOrders.refetch,
    
    createClientOrder: createClientOrder.mutate,
    createClientOrderAsync: createClientOrder.mutateAsync,
    updateClientOrder: updateClientOrder.mutate,
    deleteClientOrder: deleteClientOrder.mutate,
    
    isCreating: createClientOrder.isPending,
    isUpdating: updateClientOrder.isPending,
    isDeleting: deleteClientOrder.isPending,
    
    createError: createClientOrder.error,
    updateError: updateClientOrder.error,
    deleteError: deleteClientOrder.error,
  }
}

export const useClientOrder = (id?: number) => {
  const queryClient = useQueryClient()
  
  const orderQuery = useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrder, id],
    queryFn: () => clientOrderService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const getOrdersByClientQuery = useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-client', id],
    queryFn: () => clientOrderService.getOrdersByClient(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: ClientOrderRequest) => {
      if (!id) throw new Error("ID requis")
      return clientOrderService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
      }
      toast.success("Commande mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return clientOrderService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      toast.success("Commande supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!id) throw new Error("ID requis")
      return clientOrderService.updateOrderStatus(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
      }
      toast.success("Statut de la commande mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut")
    }
  })

  const cancelOrderMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return clientOrderService.cancelOrder(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
      }
      toast.success("Commande annulée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la commande")
    }
  })
  
  return {
    order: orderQuery.data,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
    refetch: orderQuery.refetch,
    
    ordersByClient: getOrdersByClientQuery.data,
    isLoadingOrdersByClient: getOrdersByClientQuery.isLoading,
    refetchOrdersByClient: getOrdersByClientQuery.refetch,
    
    updateClientOrder: updateMutation.mutate,
    deleteClientOrder: deleteMutation.mutate,
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

export const useClientOrdersByClient = (clientId?: number) => {
  return useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-client', clientId],
    queryFn: () => clientOrderService.getOrdersByClient(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useClientOrdersByStatus = (status: OrderStatus) => {
  return useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-status', status],
    queryFn: () => clientOrderService.getOrdersByStatus(status),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  })
}

