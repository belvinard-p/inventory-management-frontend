import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { categoryService } from '@/service/categoryService'
import { CategoryResponse, CategoryRequest } from '@/types/category'
import { ApiError } from '@/types/common'
import { CategoriesCacheKeys } from '@/lib/const'
import { useAuth } from '../useAuth'

// Hook principal pour les catégories avec pagination
export const useCategories = (page: number = 0, size: number = 50) => {
  const queryClient = useQueryClient()
  const { isAuthenticated, accessToken } = useAuth()

  // Query pour récupérer toutes les catégories avec pagination
  const getCategories = useQuery({
    queryKey: [CategoriesCacheKeys.Categories, page, size],
    queryFn: async () => {
      console.log('Fetching categories...', { page, size })
      try {
        const result = await categoryService.getAll({ page, size })
        console.log('Categories fetched successfully:', result)
        return result
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Retourner une réponse vide au lieu de lancer l'erreur
        return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, last: true }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: typeof window !== 'undefined' && isAuthenticated && !!accessToken,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000 // Keep data for 10 minutes
  })

  // Mutation pour créer une catégorie
  const createCategory = useMutation({
    mutationFn: (data: CategoryRequest) => categoryService.create(data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      enhancedToast.success("Catégorie créée avec succès", {
        description: `${newCategory.designation} a été ajoutée à votre liste`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de', newCategory.designation)
        }
      })
      // Close modal after successful creation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categoryCreated'))
      }
    },
    onError: (error: any) => {
      console.error('Erreur création catégorie:', error)
      
      if (error?.details?.status === 409 || error?.message?.includes('409')) {
        const conflictMessage = error?.details?.message || error?.details?.errors?.error || "Une catégorie avec ce code existe déjà"
        toast.error("Conflit", { description: conflictMessage })
        return
      }
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création de la catégorie"
      toast.error("Erreur de création", { description: message })
    }
  })

  // Mutation pour mettre à jour une catégorie
  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => 
      categoryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Category, variables.id] })
      toast.success("Catégorie mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  // Mutation pour supprimer une catégorie
  const deleteCategory = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      enhancedToast.actionWithUndo("Catégorie supprimée", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "La catégorie a été supprimée de votre liste"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "La catégorie n'a pas pu être supprimée",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
    }
  })

  return {
    // Queries
    categories: getCategories.data,
    isLoading: getCategories.isLoading,
    isError: getCategories.isError,
    error: getCategories.error,
    refetch: getCategories.refetch,
    
    // Mutations
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Mutation States
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    
    // Mutation Results
    createError: createCategory.error,
    updateError: updateCategory.error,
    deleteError: deleteCategory.error,
  }
}

// Hook pour la pagination infinie
export const useInfiniteCategories = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: [CategoriesCacheKeys.Categories, 'infinite'],
    queryFn: ({ pageParam = 0 }) => categoryService.getInfinite(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageNumber + 1
    },
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

// Hook spécialisé pour une catégorie spécifique
export const useCategory = (id?: number) => {
  const queryClient = useQueryClient()
  
  const categoryQuery = useQuery({
    queryKey: [CategoriesCacheKeys.Category, id],
    queryFn: () => categoryService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: CategoryRequest) => {
      if (!id) throw new Error("ID requis")
      return categoryService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Category, id] })
      }
      toast.success("Catégorie mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return categoryService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      toast.success("Catégorie supprimée avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  // Check if the error is an Axios error with response
  const isNotFound = categoryQuery.error && 
    typeof categoryQuery.error === 'object' && 
    'response' in categoryQuery.error && 
    categoryQuery.error.response && 
    typeof categoryQuery.error.response === 'object' &&
    'status' in categoryQuery.error.response &&
    categoryQuery.error.response.status === 404;
  
  return {
    category: categoryQuery.data,
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
    notFound: isNotFound,
    refetch: categoryQuery.refetch,
    
    // Mutations
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    
    // Mutation States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  }
}

// Hook pour récupérer une catégorie par entreprise
export const useCategoryByCompany = (companyId?: number) => {
  return useQuery({
    queryKey: [CategoriesCacheKeys.Categories, 'byCompany', companyId],
    queryFn: () => categoryService.getByCompany(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}