import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { companyService } from '@/service/companyService'
import { Company, CompanyRequest, ApiError } from '@/types'
import { CompaniesCacheKeys } from '@/lib/const'

// Hook principal pour les entreprises
export const useCompanies = () => {
  const queryClient = useQueryClient()

  // Query pour récupérer toutes les entreprises
  const getCompanies = useQuery({
    queryKey: [CompaniesCacheKeys.Companies],
    queryFn: async () => {
      console.log('Fetching companies...')
      try {
        const result = await companyService.getAll()
        console.log('Companies fetched successfully:', result)
        return result
      } catch (error) {
        console.error('Error fetching companies:', error)
        // Retourner une réponse vide au lieu de lancer l'erreur
        return { content: [], pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0, last: true }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Désactiver les retry pour éviter les boucles infinies
    enabled: typeof window !== 'undefined', // Éviter l'hydratation
    refetchOnWindowFocus: false, // Éviter les refetch automatiques
  })

  // Mutation pour créer une entreprise
  const createCompany = useMutation({
    mutationFn: (data: CompanyRequest) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      toast.success("Entreprise créée avec succès")
    },
    onError: (error: any) => {
      console.error('Erreur création entreprise:', error)
      
      // Gestion spécifique des erreurs 409 (conflit)
      if (error?.details?.status === 409 || error?.message?.includes('409')) {
        const conflictMessage = error?.details?.message || error?.details?.errors?.error || "Une entreprise avec ce nom existe déjà"
        toast.error("Conflit", { description: conflictMessage })
        return
      }
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création de l'entreprise"
      toast.error("Erreur de création", { description: message })
    }
  })

  // Mutation pour mettre à jour une entreprise
  const updateCompany = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyRequest }) => 
      companyService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies, variables.id] })
      toast.success("Entreprise mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  // Mutation pour supprimer une entreprise
  const deleteCompany = useMutation({
    mutationFn: (id: number) => companyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      toast.success("Entreprise supprimée avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la suppression")
    }
  })

  // Mutation pour mettre à jour l'image
  const updateCompanyImage = useMutation({
    mutationFn: ({ id, imageFile }: { id: number; imageFile: File }) => 
      companyService.updateImage(id, imageFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies, variables.id] })
      toast.success("Image mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour de l'image")
    }
  })

  return {
    // Queries
    companies: getCompanies.data,
    isLoading: getCompanies.isLoading,
    isError: getCompanies.isError,
    error: getCompanies.error,
    refetch: getCompanies.refetch,
    
    // Mutations
    createCompany: createCompany.mutate,
    updateCompany: updateCompany.mutate,
    deleteCompany: deleteCompany.mutate,
    updateCompanyImage: updateCompanyImage.mutate,
    
    // Mutation States
    isCreating: createCompany.isPending,
    isUpdating: updateCompany.isPending,
    isDeleting: deleteCompany.isPending,
    isUpdatingImage: updateCompanyImage.isPending,
    
    // Mutation Results
    createError: createCompany.error,
    updateError: updateCompany.error,
    deleteError: deleteCompany.error,
    imageError: updateCompanyImage.error,
  }
}

// Hook spécialisé pour une entreprise spécifique
export const useCompany = (id?: number) => {
  const queryClient = useQueryClient()
  
  const companyQuery = useQuery({
    queryKey: [CompaniesCacheKeys.Companies, id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: CompanyRequest) => {
      if (!id) throw new Error("ID requis")
      return companyService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies, id] })
      }
      toast.success("Entreprise mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return companyService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      toast.success("Entreprise supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })
  
  return {
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    error: companyQuery.error,
    refetch: companyQuery.refetch,
    
    // Mutations
    updateCompany: updateMutation.mutate,
    deleteCompany: deleteMutation.mutate,
    
    // Mutation States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}