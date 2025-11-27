import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { ClientOrderResponse, ClientOrderRequest, OrderStatus } from '@/types/client/clientOrder'
import { ClientOrdersCacheKeys } from '@/lib/const'

export const useClientOrders = () => {
  return useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'all'],
    queryFn: () => apiClient.get<ClientOrderResponse[]>('/orders/all'),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useClientOrder = (id?: number) => {
  const queryClient = useQueryClient()
  
  const orderQuery = useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrder, id],
    queryFn: () => apiClient.get<ClientOrderResponse>(`/orders/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const getOrdersByClientQuery = useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-client', id],
    queryFn: () => apiClient.get<ClientOrderResponse[]>(`/orders/client/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: ClientOrderRequest) => {
      if (!id) throw new Error("ID requis")
      return apiClient.put<ClientOrderResponse>(`/orders/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Commande mise à jour avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return apiClient.delete(`/orders/${id}`, {
        showSuccessToast: true,
        successMessage: 'Commande supprimée avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!id) throw new Error("ID requis")
      return apiClient.patch<ClientOrderResponse>(`/orders/${id}/status?status=${status}`, undefined, {
        showSuccessToast: true,
        successMessage: 'Statut mis à jour avec succès',
        showErrorToast: false
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
    }
  })

  const cancelOrderMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return apiClient.patch<ClientOrderResponse>(`/orders/${id}/cancel`, undefined, {
        showSuccessToast: true,
        successMessage: 'Commande annulée avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrder, id] })
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

export const useCreateClientOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ClientOrderRequest) => 
      apiClient.post<ClientOrderResponse>('/orders/create', data, {
        showSuccessToast: true,
        successMessage: 'Commande créée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
    }
  })
}

export const useUpdateClientOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientOrderRequest }) => 
      apiClient.put<ClientOrderResponse>(`/orders/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Commande modifiée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
    }
  })
}

export const useDeleteClientOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => 
      apiClient.delete(`/orders/${id}`, {
        showSuccessToast: true,
        successMessage: 'Commande supprimée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientOrdersCacheKeys.ClientOrders] })
    }
  })
}

export const useClientOrdersByClient = (clientId?: number) => {
  return useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-client', clientId],
    queryFn: () => apiClient.get<ClientOrderResponse[]>(`/orders/client/${clientId}`),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useClientOrdersByStatus = (status: OrderStatus) => {
  return useQuery({
    queryKey: [ClientOrdersCacheKeys.ClientOrders, 'by-status', status],
    queryFn: () => apiClient.get<ClientOrderResponse[]>(`/orders/status/${status}`),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  })
}