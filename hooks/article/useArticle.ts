import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'
import { articleService } from '@/service/articleService'
import { apiClient } from '@/lib/apiClient'
import { ArticleResponse, ArticleRequest } from '@/types/article'
import { ApiError } from '@/types'
import { ArticlesCacheKeys } from '@/lib/const'

export const useArticles = (page: number = 0, size: number = 50) => {
  const queryClient = useQueryClient()

  const getArticles = useQuery({
    queryKey: [ArticlesCacheKeys.Articles, page, size],
    queryFn: async () => {
      console.log('Fetching articles...', { page, size })
      try {
        const result = await articleService.getAll({ page, size })
        console.log('Articles fetched successfully:', result)
        console.log('First article ID:', result.content[0]?.id, 'Page returned:', result.pageNumber)
        return result
      } catch (error) {
        console.error('Error fetching articles:', error)
       
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

  const createArticle = useMutation({
    mutationFn: (data: ArticleRequest) => articleService.create(data),
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      enhancedToast.success("Article créé avec succès", {
        description: `${newArticle.designation} a été ajouté à votre liste`,
        action: {
          label: "Voir détails",
          onClick: () => console.log('Voir détails de', newArticle.designation)
        }
      })
    },
    onError: async (error: any) => {
      console.error('Erreur création article:', error)
      
      if (error?.details?.status === 409 || error?.message?.includes('409')) {
        const conflictMessage = error?.details?.message || error?.details?.errors?.error || "Un article avec ce code existe déjà"
        toast.error("Conflit", { description: conflictMessage })
        return
      }
      
      // Fetch low stock count to display in error using apiClient directly
      let lowStockCount = 0
      try {
        lowStockCount = await apiClient.get<number>('/articles/low-stock/count', {
          showErrorToast: false
        })
      } catch (err) {
        console.error('Failed to fetch low stock count:', err)
      }
      
      const message = error?.details?.message || error?.message || "Erreur lors de la création de l'article"
      toast.error("Erreur de création", { 
        description: `${message} (Articles en stock faible: ${lowStockCount})` 
      })
    }
  })

  const updateArticle = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ArticleRequest }) => 
      articleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles, variables.id] })
      toast.success("Article mis à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour")
    }
  })

  const deleteArticle = useMutation({
    mutationFn: (id: number) => articleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      enhancedToast.actionWithUndo("Article supprimé", () => {
        enhancedToast.info("Fonction de restauration à implémenter")
      }, {
        description: "L'article a été supprimé de votre liste"
      })
    },
    onError: (error: ApiError) => {
      enhancedToast.error("Erreur lors de la suppression", {
        description: "L'article n'a pas pu être supprimé",
        action: {
          label: "Réessayer",
          onClick: () => window.location.reload()
        }
      })
    }
  })

  const updateArticleImage = useMutation({
    mutationFn: ({ id, imageFile }: { id: number; imageFile: File }) => 
      articleService.uploadImage(id, imageFile),
    onSuccess: async (_, variables) => {
      // Invalider toutes les queries liées à cet article
      await queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      await queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles, variables.id] })
      // Forcer le refetch de l'URL d'image pour obtenir la nouvelle URL signée
      await queryClient.refetchQueries({ queryKey: [ArticlesCacheKeys.Articles, variables.id, 'imageUrl'] })
      // Invalider également les queries d'images génériques
      await queryClient.invalidateQueries({ queryKey: ['image', 'article', variables.id] })
      toast.success("Image mise à jour avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la mise à jour de l'image")
    }
  })

  const restoreArticle = useMutation({
    mutationFn: (id: number) => articleService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      toast.success("Article restauré avec succès")
    },
    onError: (error: ApiError) => {
      toast.error("Erreur lors de la restauration de l'article")
    }
  })

  const getArchivedArticles = useQuery({
    queryKey: [ArticlesCacheKeys.Articles, 'archived'],
    queryFn: () => articleService.getArchived(),
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })

  return {
   
    articles: getArticles.data,
    isLoading: getArticles.isLoading,
    isError: getArticles.isError,
    error: getArticles.error,
    refetch: getArticles.refetch,
   
    archivedArticles: getArchivedArticles.data,
    isLoadingArchived: getArchivedArticles.isLoading,
    
    createArticle: createArticle.mutate,
    createArticleAsync: createArticle.mutateAsync,
    updateArticle: updateArticle.mutate,
    deleteArticle: deleteArticle.mutate,
    updateArticleImage: updateArticleImage.mutate,
    restoreArticle: restoreArticle.mutate,
    
    isCreating: createArticle.isPending,
    isUpdating: updateArticle.isPending,
    isDeleting: deleteArticle.isPending,
    isUpdatingImage: updateArticleImage.isPending,
    isRestoring: restoreArticle.isPending,
    
    // Mutation Results
    createError: createArticle.error,
    updateError: updateArticle.error,
    deleteError: deleteArticle.error,
    imageError: updateArticleImage.error,
    restoreError: restoreArticle.error,
  }
}

export const useArticleImageUrl = (articleId?: number, expirationMinutes: number = 15) => {
  return useQuery({
    queryKey: [ArticlesCacheKeys.Articles, articleId, 'imageUrl'],
    queryFn: async () => {
      try {
        return await articleService.getImageUrl(articleId!, expirationMinutes)
      } catch (error: any) {

        if (error?.message?.includes('No image found')) {
          return null
        }
    
        throw error
      }
    },
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000, // 10 minutes (moins que l'expiration de l'URL)
    retry: false, 
  })
}


export const useInfiniteArticles = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: [ArticlesCacheKeys.Articles, 'infinite'],
    queryFn: ({ pageParam = 0 }) => articleService.getInfinite(pageParam, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.pageNumber + 1
    },
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })
}

export const useArticle = (id?: number) => {
  const queryClient = useQueryClient()
  
  const articleQuery = useQuery({
    queryKey: [ArticlesCacheKeys.Articles, id],
    queryFn: () => articleService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const articleByCodeQuery = useQuery({
    queryKey: [ArticlesCacheKeys.Articles, 'code', id],
    queryFn: () => articleService.getByCode(id?.toString()!),
    enabled: false, 
    staleTime: 5 * 60 * 1000,
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: ArticleRequest) => {
      if (!id) throw new Error("ID requis")
      return articleService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles, id] })
      }
      toast.success("Article mis à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return articleService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      toast.success("Article supprimé avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la suppression")
    }
  })

  const restoreMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID requis")
      return articleService.restore(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      toast.success("Article restauré avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la restauration")
    }
  })

  const updateImageMutation = useMutation({
    mutationFn: (imageFile: File) => {
      if (!id) throw new Error("ID requis")
      return articleService.uploadImage(id, imageFile)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles] })
      if (id) {
        queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles, id] })
        queryClient.invalidateQueries({ queryKey: [ArticlesCacheKeys.Articles, id, 'imageUrl'] })
      }
      toast.success("Image mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'image")
    }
  })
  
  return {
    article: articleQuery.data,
    isLoading: articleQuery.isLoading,
    isError: articleQuery.isError,
    error: articleQuery.error,
    refetch: articleQuery.refetch,
    
    articleByCode: articleByCodeQuery.data,
    isLoadingByCode: articleByCodeQuery.isLoading,
    fetchArticleByCode: articleByCodeQuery.refetch,
    
    updateArticle: updateMutation.mutate,
    deleteArticle: deleteMutation.mutate,
    restoreArticle: restoreMutation.mutate,
    updateArticleImage: updateImageMutation.mutate,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isUpdatingImage: updateImageMutation.isPending,
    
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    restoreError: restoreMutation.error,
    imageError: updateImageMutation.error,
  }
}

