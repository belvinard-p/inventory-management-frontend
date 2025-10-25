import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { categoryService } from '@/service/categoryService'
import { CategoryResponse, CategoryRequest } from '@/types/category'
import { ApiError } from '@/types/common'
import { useCompany } from '../useCompany'

// Cache keys for categories
export const CategoriesCacheKeys = {
  Categories: 'categories',
  Category: 'category',
  ArticlesByCategory: 'articles-by-category'
} as const

// Hook principal pour les catégories avec pagination
export const useCategories = (page: number = 0, size: number = 50, companyId?: number) => {
  const queryClient = useQueryClient()

  // Query pour récupérer toutes les catégories avec pagination
  const getCategories = useQuery({
    queryKey: [CategoriesCacheKeys.Categories, page, size, companyId],
    queryFn: async () => {
      try {
        const result = await categoryService.getAll({ 
          page, 
          size,
          companyId
        })
        return result
      } catch (error) {
        console.error('Error fetching categories:', error)
        return { 
          content: [], 
          pageNumber: 0, 
          pageSize: size, 
          totalElements: 0, 
          totalPages: 0, 
          last: true 
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: typeof window !== 'undefined' && (companyId !== undefined),
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
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryRequest> }) => 
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

  // Récupérer les articles d'une catégorie
  const getArticlesByCategory = (categoryId: number) => {
    return useQuery({
      queryKey: [CategoriesCacheKeys.ArticlesByCategory, categoryId],
      queryFn: () => categoryService.getArticlesByCategory(categoryId),
      enabled: !!categoryId,
      staleTime: 5 * 60 * 1000
    })
  }

  // Hook pour la pagination infinie
  const useInfiniteCategories = (pageSize: number = 10, companyId?: number) => {
    return useInfiniteQuery({
      queryKey: [CategoriesCacheKeys.Categories, 'infinite', companyId],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await categoryService.getInfinite(pageParam, pageSize, companyId)
        return {
          data: response.content,
          nextPage: response.last ? undefined : pageParam + 1,
          totalElements: response.totalElements
        }
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      enabled: companyId !== undefined
    })
  }

  return {
    // Queries
    getCategories,
    getArticlesByCategory,
    useInfiniteCategories,
    
    // Mutations
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Loading states
    isLoading: getCategories.isLoading,
    isFetching: getCategories.isFetching,
    
    // Error states
    error: getCategories.error
  }
}

// Hook spécialisé pour une catégorie spécifique
export const useCategory = (id?: number) => {
  const { data: category, isLoading, error } = useQuery<CategoryResponse, ApiError>({
    queryKey: [CategoriesCacheKeys.Category, id],
    queryFn: () => id ? categoryService.getById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })

  // Check if the error is an Axios error with response
  const isNotFound = error && 
    typeof error === 'object' && 
    'response' in error && 
    error.response && 
    typeof error.response === 'object' &&
    'status' in error.response &&
    error.response.status === 404;

  return {
    category,
    isLoading,
    error,
    notFound: isNotFound
  }
}