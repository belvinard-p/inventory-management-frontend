import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/service/companyService'

export const useImageQuery = (filename: string | null) => {
  return useQuery({
    queryKey: ['image', filename],
    queryFn: async () => {
      const blob = await companyService.getImage(filename!)
      return URL.createObjectURL(blob)
    },
    enabled: !!filename,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}