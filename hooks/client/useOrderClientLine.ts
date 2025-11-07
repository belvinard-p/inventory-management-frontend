import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { orderClientLineService } from '@/service/client/orderClientLineService'
import { OrderClientLineResponse, OrderClientLineRequest } from '@/types/client/orderClientLine'
import { ApiError } from '@/types'
import { OrderClientLinesCacheKeys } from '@/lib/const'

export const useOrderClientLines = () => {
  const queryClient = useQueryClient()

  const createOrderClientLine = useMutation({
    mutationFn: (data: OrderClientLineRequest) => orderClientLineService.create(data),
    onSuccess: (newLine, variables) => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines, 'order', variables.clientOrderId] })
      enhancedToast.success("Ligne de commande créée avec succès", {
        description: `Ligne ajoutée à la commande`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de la ligne')
        }
      })
    },
    onError: async (error: any) => {
      console.error('Erreur création ligne de commande:', error)
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création de la ligne de commande"
      toast.error("Erreur de création", { description: message })
    }
  })

  const updateOrderClientLine = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => 
      orderClientLineService.updateLineQuantity(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLine, variables.id] })
      toast.success("Ligne de commande mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteOrderClientLine = useMutation({
    mutationFn: (id: number) => orderClientLineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OrderClientLinesCacheKeys.OrderClientLines] })
      enhancedToast.actionWithUndo("Ligne supprimée", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "La ligne de commande a été supprimée"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "La ligne de commande n'a pas pu être supprimée",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
    }
  })

  return {
    createOrderClientLine: createOrderClientLine.mutate,
    createOrderClientLineAsync: createOrderClientLine.mutateAsync,
    updateOrderClientLine: updateOrderClientLine.mutate,
    deleteOrderClientLine: deleteOrderClientLine.mutate,
    
    isCreating: createOrderClientLine.isPending,
    isUpdating: updateOrderClientLine.isPending,
    isDeleting: deleteOrderClientLine.isPending,
    
    createError: createOrderClientLine.error,
    updateError: updateOrderClientLine.error,
    deleteError: deleteOrderClientLine.error,
  }
}

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

