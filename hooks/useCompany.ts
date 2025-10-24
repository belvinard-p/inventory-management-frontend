import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { companyService } from '@/service/companyService'
import { Company, CompanyRequest, ApiError } from '@/types'
import { CompaniesCacheKeys } from '@/lib/const'

// Hook principal pour les entreprises avec pagination
export const useCompanies = (page: number = 0, size: number = 50) => {
  const queryClient = useQueryClient()

  // Query pour récupérer toutes les entreprises avec pagination
  const getCompanies = useQuery({
    queryKey: [CompaniesCacheKeys.Companies, page, size],
    queryFn: async () => {
      console.log('Fetching companies...', { page, size })
      try {
        const result = await companyService.getAll({ page, size })
        console.log('Companies fetched successfully:', result)
        console.log('First company ID:', result.content[0]?.id, 'Page returned:', result.pageNumber)
        return result
      } catch (error) {
        console.error('Error fetching companies:', error)
        // Retourner une réponse vide au lieu de lancer l'erreur
        return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, last: true }
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
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: [CompaniesCacheKeys.Companies] })
      enhancedToast.success("Entreprise créée avec succès", {
        description: `${newCompany.name} a été ajoutée à votre liste`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de', newCompany.name)
        }
      })
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
      enhancedToast.actionWithUndo("Entreprise supprimée", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "L'entreprise a été supprimée de votre liste"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "L'entreprise n'a pas pu être supprimée",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
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
    createCompanyAsync: createCompany.mutateAsync,
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

// Hook pour récupérer l'URL de l'image d'une entreprise
export const useCompanyImageUrl = (companyId?: number, expirationMinutes: number = 15) => {
  return useQuery({
    queryKey: [CompaniesCacheKeys.Companies, companyId, 'imageUrl'],
    queryFn: async () => {
      try {
        return await companyService.getImageUrl(companyId!, expirationMinutes)
      } catch (error: any) {
        // Si l'erreur indique qu'il n'y a pas d'image, retourner null silencieusement
        if (error?.message?.includes('No image found')) {
          return null
        }
        // Pour les autres erreurs, les laisser passer
        throw error
      }
    },
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes (moins que l'expiration de l'URL)
    retry: false, // Pas de retry pour éviter les erreurs répétées
  })
}

// Hook pour la pagination infinie
export const useInfiniteCompanies = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: [CompaniesCacheKeys.Companies, 'infinite'],
    queryFn: ({ pageParam = 0 }) => companyService.getInfinite(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageNumber + 1
    },
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
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