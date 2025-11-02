import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/service/companyService'
import { articleService } from '@/service/articleService'

type ImageSource = 'company' | 'article'

interface UseImageQueryOptions {
  source: ImageSource
  filename?: string | null
  articleId?: number | null
  expirationMinutes?: number
}

export const useImageQuery = (options: UseImageQueryOptions) => {
  const { source, filename, articleId, expirationMinutes = 15 } = options

  return useQuery({
    queryKey: ['image', source, filename || articleId, expirationMinutes],
    queryFn: async () => {
      if (source === 'company' && filename) {
        const blob = await companyService.getImage(filename)
        return URL.createObjectURL(blob)
      } else if (source === 'article' && articleId) {
        // Pour les articles, on obtient directement l'URL signée
        const url = await articleService.getImageUrl(articleId, expirationMinutes)
        return url
      }
      throw new Error('Invalid image query parameters')
    },
    enabled: (source === 'company' && !!filename) || (source === 'article' && !!articleId),
    staleTime: (expirationMinutes - 1) * 60 * 1000, // Stale time légèrement inférieur à l'expiration
    retry: 1,
    gcTime: expirationMinutes * 60 * 1000 // Garbage collection time
  })
}

// Hook de compatibilité pour l'ancienne API
export const useImageQueryByFilename = (filename: string | null) => {
  return useImageQuery({ source: 'company', filename })
}