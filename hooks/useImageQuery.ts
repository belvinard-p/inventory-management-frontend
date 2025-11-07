import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

type ImageSource = 'company' | 'article'

interface UseImageQueryOptions {
  source: ImageSource
  filename?: string | null
  articleId?: number | null
  companyId?: number | null
  expirationMinutes?: number
}

export const useImageQuery = (options: UseImageQueryOptions) => {
  const { source, filename, articleId, companyId, expirationMinutes = 15 } = options

  return useQuery({
    queryKey: ['image', source, filename || articleId || companyId, expirationMinutes],
    queryFn: async () => {
      if (source === 'company' && companyId) {
        return apiClient.get<string>(`/companies/${companyId}/image-url?expirationMinutes=${expirationMinutes}`)
      } else if (source === 'company' && filename) {
        const blob = await apiClient.get(`/companies/image/${filename}`, { responseType: 'blob' })
        return URL.createObjectURL(blob as Blob)
      } else if (source === 'article' && articleId) {
        return apiClient.get<string>(`/articles/${articleId}/image-url?expirationMinutes=${expirationMinutes}`)
      }
      throw new Error('Invalid image query parameters')
    },
    enabled: (source === 'company' && (!!filename || !!companyId)) || (source === 'article' && !!articleId),
    staleTime: (expirationMinutes - 1) * 60 * 1000,
    retry: false,
    gcTime: expirationMinutes * 60 * 1000
  })
}

// Hook de compatibilité pour l'ancienne API
export const useImageQueryByFilename = (filename: string | null) => {
  return useImageQuery({ source: 'company', filename })
}

export const useCompanyImage = (companyId: number | null, expirationMinutes: number = 15) => {
  return useImageQuery({ source: 'company', companyId, expirationMinutes })
}

export const useArticleImage = (articleId: number | null, expirationMinutes: number = 15) => {
  return useImageQuery({ source: 'article', articleId, expirationMinutes })
}