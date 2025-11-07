import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { clientService } from '@/service/client/clientService'
import { ClientResponse, ClientRequest } from '@/types/client/client'
import { ApiError } from '@/types'
import { ClientsCacheKeys } from '@/lib/const'

export const useClients = (page: number = 0, size: number = 50) => {
  const queryClient = useQueryClient()

  const getClients = useQuery({
    queryKey: [ClientsCacheKeys.Clients, page, size],
    queryFn: async () => {
      console.log('Fetching clients...', { page, size })
      try {
        const result = await clientService.getAll({ page, size })
        console.log('Clients fetched successfully:', result)
        return result
      } catch (error) {
        console.error('Error fetching clients:', error)
        return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, last: true }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: typeof window !== 'undefined',
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000
  })

  const createClient = useMutation({
    mutationFn: (data: ClientRequest) => clientService.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      enhancedToast.success("Client créé avec succès", {
        description: `${newClient.name} a été ajouté à votre liste`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de', newClient.name)
        }
      })
    },
    onError: async (error: any) => {
      console.error('Erreur création client:', error)
      
      if (error?.details?.status === 409 || error?.message?.includes('409')) {
        const conflictMessage = error?.details?.message || error?.details?.errors?.error || "Un client avec cet email existe déjà"
        toast.error("Conflit", { description: conflictMessage })
        return
      }
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création du client"
      toast.error("Erreur de création", { description: message })
    }
  })

  const updateClient = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientRequest }) => 
      clientService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Client, variables.id] })
      toast.success("Client mis à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteClient = useMutation({
    mutationFn: (id: number) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      enhancedToast.actionWithUndo("Client supprimé", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "Le client a été supprimé de votre liste"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "Le client n'a pas pu être supprimé",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
    }
  })

  return {
    clients: getClients.data,
    isLoading: getClients.isLoading,
    isError: getClients.isError,
    error: getClients.error,
    refetch: getClients.refetch,
    
    createClient: createClient.mutate,
    createClientAsync: createClient.mutateAsync,
    updateClient: updateClient.mutate,
    deleteClient: deleteClient.mutate,
    
    isCreating: createClient.isPending,
    isUpdating: updateClient.isPending,
    isDeleting: deleteClient.isPending,
    
    createError: createClient.error,
    updateError: updateClient.error,
    deleteError: deleteClient.error,
  }
}

export const useInfiniteClients = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: [ClientsCacheKeys.Clients, 'infinite'],
    queryFn: ({ pageParam = 0 }) => clientService.getInfinite(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageNumber + 1
    },
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useClient = (id?: number) => {
  const queryClient = useQueryClient()
  
  const clientQuery = useQuery({
    queryKey: [ClientsCacheKeys.Client, id],
    queryFn: () => clientService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: ClientRequest) => {
      if (!id) throw new Error("ID requis")
      return clientService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Client, id] })
      }
      toast.success("Client mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return clientService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ClientsCacheKeys.Clients] })
      toast.success("Client supprimé avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
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


