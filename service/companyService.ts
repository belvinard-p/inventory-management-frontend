import { apiClient } from "@/lib/apiClient"
import { Company, CompanyRequest } from "@/types"

const BASE_URL = "/companies"

interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface GetAllCompaniesParams {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const companyService = {
  // Créer une entreprise (ADMIN, MANAGER)
  create: async (data: CompanyRequest): Promise<Company> => {
    return apiClient.post<Company>(`${BASE_URL}/create`, data)
  },

  // Récupérer toutes les entreprises avec pagination (ALL ROLES)
  getAll: async (params?: GetAllCompaniesParams): Promise<PaginatedResponse<Company>> => {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber !== undefined) searchParams.append('pageNumber', params.pageNumber.toString())
    if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
    
    const queryString = searchParams.toString()

    return apiClient.get<PaginatedResponse<Company>>(`${BASE_URL}/all${queryString ? `?${queryString}` : ''}`, {
      showErrorToast: false // Désactiver les toasts d'erreur pour cet endpoint
    })
  },

  // Récupérer une entreprise par ID (ALL ROLES)
  getById: async (id: number): Promise<Company> => {
    return apiClient.get<Company>(`${BASE_URL}/${id}`)
  },

  // Mettre à jour une entreprise (ADMIN only)
  update: async (id: number, data: CompanyRequest): Promise<Company> => {
    return apiClient.put<Company>(`${BASE_URL}/${id}`, data)
  },

  // Supprimer une entreprise (ADMIN only)
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  // Mettre à jour l'image d'une entreprise (ADMIN only)
  updateImage: async (id: number, imageFile: File): Promise<Company> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return apiClient.put<Company>(`${BASE_URL}/${id}/image`, formData)
  }
}
