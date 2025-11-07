import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Company, CompanyRequest } from '@/types'

export const useCompanies = (page: number = 0, size: number = 50) => {
  return useQuery<{
    content: Company[]
    totalElements: number
    totalPages: number
    size: number
    number: number
  }>({
    queryKey: ['companies', page, size],
    queryFn: () => apiClient.get(`/companies/all?pageNumber=${page}&pageSize=${size}`),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useCompany = (id?: number) => {
  const queryClient = useQueryClient()
  
  const companyQuery = useQuery({
    queryKey: ['company', id],
    queryFn: () => apiClient.get<Company>(`/companies/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: CompanyRequest) => {
      if (!id) throw new Error("ID requis")
      return apiClient.put<Company>(`/companies/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Entreprise mise à jour avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company', id] })
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return apiClient.delete(`/companies/${id}`, {
        showSuccessToast: true,
        successMessage: 'Entreprise supprimée avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
  
  return {
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
    
    updateCompany: updateMutation.mutate,
    deleteCompany: deleteMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CompanyRequest) => 
      apiClient.post<Company>('/companies/create', data, {
        showSuccessToast: true,
        successMessage: 'Entreprise créée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyRequest }) => 
      apiClient.put<Company>(`/companies/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Entreprise modifiée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => 
      apiClient.delete(`/companies/${id}`, {
        showSuccessToast: true,
        successMessage: 'Entreprise supprimée avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    }
  })
}

export const useCompanyImageUrl = (companyId?: number, expirationMinutes: number = 15) => {
  return useQuery({
    queryKey: ['company-image', companyId, expirationMinutes],
    queryFn: () => apiClient.get<string>(`/companies/${companyId}/image-url?expirationMinutes=${expirationMinutes}`),
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}

export const useUpdateCompanyImage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, imageFile }: { id: number; imageFile: File }) => {
      const formData = new FormData()
      formData.append('image', imageFile)
      return apiClient.put(`/companies/${id}/image`, formData, {
        showSuccessToast: true,
        successMessage: 'Image mise à jour avec succès'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company-image'] })
    }
  })
}