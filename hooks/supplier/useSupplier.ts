import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierService } from '@/service/supplier/supplierService'
import { SupplierRequest } from '@/types/supplier/supplier'
import { SuppliersCacheKeys } from '@/lib/const'

export const useSuppliers = () => {
    return useQuery({
        queryKey: [SuppliersCacheKeys.Suppliers],
        queryFn: () => supplierService.getAll(),
        staleTime: 5 * 60 * 1000,
        enabled: globalThis.window !== undefined,
    })
}

export const useSupplier = (id?: number) => {
    const queryClient = useQueryClient()

    const supplierQuery = useQuery({
        queryKey: [SuppliersCacheKeys.Supplier, id],
        queryFn: () => supplierService.getById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })

    const updateMutation = useMutation({
        mutationFn: (data: SupplierRequest) => {
            if (!id) throw new Error("ID requis")
            return supplierService.update(id, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Suppliers] })
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Supplier, id] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: () => {
            if (!id) throw new Error("ID requis")
            return supplierService.delete(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Suppliers] })
        }
    })

    return {
        supplier: supplierQuery.data,
        isLoading: supplierQuery.isLoading,
        isError: supplierQuery.isError,
        error: supplierQuery.error,
        refetch: supplierQuery.refetch,

        updateSupplier: updateMutation.mutate,
        deleteSupplier: deleteMutation.mutate,

        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,

        updateError: updateMutation.error,
        deleteError: deleteMutation.error,
    }
}

export const useCreateSupplier = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SupplierRequest) => supplierService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Suppliers] })
        }
    })
}

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: SupplierRequest }) =>
            supplierService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Suppliers] })
        }
    })
}

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => supplierService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SuppliersCacheKeys.Suppliers] })
        }
    })
}
