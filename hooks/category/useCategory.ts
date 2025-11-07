import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { CategoryResponse, CategoryRequest } from '@/types/category'

export const useCategories = (page: number = 0, size: number = 50) => {
  return useQuery<{
    content: CategoryResponse[]
    totalElements: number
    totalPages: number
    size: number
    number: number
  }>({
    queryKey: ['categories', page, size],
    queryFn: () => apiClient.get(`/categories/all?pageNumber=${page}&pageSize=${size}`),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useCategory = (id?: number) => {
  const queryClient = useQueryClient()
  
  const categoryQuery = useQuery({
    queryKey: ['category', id],
    queryFn: () => apiClient.get<CategoryResponse>(`/categories/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: CategoryRequest) => {
      if (!id) throw new Error("ID requis")
      return apiClient.put<CategoryResponse>(`/categories/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Catégorie mise à jour avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', id] })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return apiClient.delete(`/categories/${id}`, {
        showSuccessToast: true,
        successMessage: 'Catégorie supprimée avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
  
  return {
    category: categoryQuery.data,
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
    refetch: categoryQuery.refetch,
    
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CategoryRequest) => 
      apiClient.post<CategoryResponse>('/categories/create', data, {
        showSuccessToast: true,
        successMessage: 'Catégorie créée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => 
      apiClient.put<CategoryResponse>(`/categories/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Catégorie modifiée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => 
      apiClient.delete(`/categories/${id}`, {
        showSuccessToast: true,
        successMessage: 'Catégorie supprimée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

export const useCategoryByCompany = (companyId?: number) => {
  return useQuery({
    queryKey: ['categories', 'by-company', companyId],
    queryFn: () => apiClient.get<CategoryResponse[]>(`/categories/company/${companyId}`),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}