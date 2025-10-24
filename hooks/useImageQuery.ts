import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { useEffect } from 'react'

export const useImageQuery = (filename: string | null) => {
  const query = useQuery({
    queryKey: ['image', filename],
    queryFn: async () => {
      try {
        const blob = await apiClient.get<Blob>(`/files/${filename}`, {
          responseType: 'blob',
          showErrorToast: false
        })
        return URL.createObjectURL(blob)
      } catch (error) {
        console.error('Failed to fetch image:', error)
        throw error
      }
    },
    enabled: !!filename,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })

  // Cleanup blob URL when component unmounts or data changes
  useEffect(() => {
    return () => {
      if (query.data && typeof query.data === 'string') {
        URL.revokeObjectURL(query.data)
      }
    }
  }, [query.data])

  return query
}