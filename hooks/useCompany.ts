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
    queryFn: () => companyService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: typeof window !== 'undefined', // Éviter l'hydratation
  })

  // Query pour une entreprise spécifique
  const useCompanyById = (id?: number) =>
    useQuery({
      queryKey: [CompaniesCacheKeys.Companies, id],
      queryFn: () => companyService.getById(id!),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
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
      const message = error?.response?.data?.message || error?.message || "Erreur lors de la création de l'entreprise"
      toast.error(message)
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
    useCompanyById,
    
    // Mutations
    createCompany: createCompany.mutate,
    updateCompany: updateCompany.mutate,
    deleteCompany: deleteCompany.mutate,
    updateCompanyImage: updateCompanyImage.mutate,
    
    // States
    isCreating: createCompany.isPending,
    isUpdating: updateCompany.isPending,
    isDeleting: deleteCompany.isPending,
    isUpdatingImage: updateCompanyImage.isPending,
  }
}

// Hook spécialisé pour une entreprise spécifique
export const useCompany = (id?: number) => {
  const { useCompanyById, updateCompany, deleteCompany, updateCompanyImage } = useCompanies()
  const companyQuery = useCompanyById(id)
  
  return {
    company: companyQuery.data,
    isLoading: companyQuery.isLoading,
    isError: companyQuery.isError,
    refetch: companyQuery.refetch,
    
    // Mutations pré-liées à l'ID
    updateCompany: (data: CompanyRequest) => {
      if (!id) throw new Error("ID requis")
      return updateCompany({ id, data })
    },
    deleteCompany: () => {
      if (!id) throw new Error("ID requis")
      return deleteCompany(id)
    },
    updateImage: (imageFile: File) => {
      if (!id) throw new Error("ID requis")
      return updateCompanyImage({ id, imageFile })
    }
  }
}