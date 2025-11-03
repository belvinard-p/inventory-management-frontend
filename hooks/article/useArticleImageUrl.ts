import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { ArticlesCacheKeys } from '@/lib/const'

export const useArticleImageUrl = (articleId?: number, expirationMinutes: number = 15) => {
  return useQuery({
    queryKey: [ArticlesCacheKeys.Articles, articleId, 'imageUrl'],
    queryFn: () => apiClient.get<string>(`/articles/${articleId}/image_url?expirationMinutes=${expirationMinutes}`, {
      showErrorToast: false
    }),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}