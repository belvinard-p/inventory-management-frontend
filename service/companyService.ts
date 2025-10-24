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
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export const companyService = {
  // Créer une entreprise (ADMIN, MANAGER)
  create: async (data: CompanyRequest): Promise<Company> => {
    return apiClient.post<Company>(`${BASE_URL}/create`, data)
  },

  // Récupérer toutes les entreprises avec pagination (ALL ROLES)
  getAll: async (params?: GetAllCompaniesParams): Promise<PaginatedResponse<Company>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append('page', params.page.toString())
    if (params?.size !== undefined) searchParams.append('size', params.size.toString())
    if (params?.sort) searchParams.append('sort', params.sort)
    if (params?.direction) searchParams.append('direction', params.direction)
    
    const queryString = searchParams.toString()
    const url = `${BASE_URL}/all${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<PaginatedResponse<Company>>(url, {
      showErrorToast: false // Désactiver les toasts d'erreur pour cet endpoint
    })
  },

  // Récupérer les entreprises avec pagination infinie
  getInfinite: async (pageParam: number = 0, size: number = 10): Promise<PaginatedResponse<Company>> => {
    const searchParams = new URLSearchParams()
    searchParams.append('page', pageParam.toString())
    searchParams.append('size', size.toString())
    
    const url = `${BASE_URL}/all?${searchParams.toString()}`
    
    return apiClient.get<PaginatedResponse<Company>>(url, {
      showErrorToast: false
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
    // Don't set Content-Type header manually for FormData, let the browser set it
    return apiClient.put<Company>(`${BASE_URL}/${id}/image`, formData)
  },

  // Récupérer une image (ALL ROLES)
  getImage: async (filename: string): Promise<Blob> => {
    return apiClient.get<Blob>(`/files/${filename}`, {
      responseType: 'blob'
    })
  },

  // Récupérer l'URL de l'image d'une entreprise (ALL ROLES)
  getImageUrl: async (id: number, expirationMinutes: number = 15): Promise<string> => {
    return apiClient.get<string>(`${BASE_URL}/${id}/image_url?expirationMinutes=${expirationMinutes}`, {
      showErrorToast: false // Désactiver les toasts d'erreur pour cet endpoint
    })
  }
}
