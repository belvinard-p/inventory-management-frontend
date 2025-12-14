import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { saleService } from '@/service/saleService'
import { Sale, SaleRequest, SaleStatus } from '@/types/sale'
import { SalesCacheKeys } from '@/lib/const'

export const useSales = () => {
  return useQuery({
    queryKey: [SalesCacheKeys.Sales],
    queryFn: () => saleService.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useSale = (id?: number) => {
  const queryClient = useQueryClient()
  
  const saleQuery = useQuery({
    queryKey: [SalesCacheKeys.Sale, id],
    queryFn: () => saleService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: SaleRequest) => {
      if (!id) throw new Error("ID requis")
      return saleService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sale, id] })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return saleService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
  
  return {
    sale: saleQuery.data,
    isLoading: saleQuery.isLoading,
    isError: saleQuery.isError,
    error: saleQuery.error,
    refetch: saleQuery.refetch,
    
    updateSale: updateMutation.mutate,
    deleteSale: deleteMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SaleRequest) => saleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SaleRequest }) => 
      saleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useDeleteSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => saleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: SaleStatus }) => 
      saleService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useCancelSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => saleService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useFinalizeSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => saleService.finalize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}

export const useGenerateSaleLines = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => saleService.generateSaleLines(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalesCacheKeys.Sales] })
    }
  })
}