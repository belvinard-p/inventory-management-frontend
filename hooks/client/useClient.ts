import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { ClientResponse, ClientRequest } from '@/types/client/client'
import { ClientsCacheKeys } from '@/lib/const'

export const useClients = (page: number = 0, size: number = 50) => {
  return useQuery({
    queryKey: [ClientsCacheKeys.Clients, page, size],
    queryFn: () => apiClient.get<{
      content: ClientResponse[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }>(`/clients/all?pageNumber=${page}&pageSize=${size}`),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useClient = (id?: number) => {
  const queryClient = useQueryClient()
  
  const clientQuery = useQuery({
    queryKey: [ClientsCacheKeys.Client, id],
    queryFn: () => apiClient.get<ClientResponse>(`/clients/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: ClientRequest) => {
      if (!id) throw new Error("ID requis")
      return apiClient.put<ClientResponse>(`/clients/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Client mis à jour avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Client, id] })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return apiClient.delete(`/clients/${id}`, {
        showSuccessToast: true,
        successMessage: 'Client supprimé avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
    }
  })
  
  return {
    client: clientQuery.data,
    isLoading: clientQuery.isLoading,
    isError: clientQuery.isError,
    error: clientQuery.error,
    refetch: clientQuery.refetch,
    
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: ClientRequest) => 
      apiClient.post<ClientResponse>('/clients/create', data, {
        showSuccessToast: true,
        successMessage: 'Client créé avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
    }
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientRequest }) => 
      apiClient.put<ClientResponse>(`/clients/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Client modifié avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
    }
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => 
      apiClient.delete(`/clients/${id}`, {
        showSuccessToast: true,
        successMessage: 'Client supprimé avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
    }
  })
}