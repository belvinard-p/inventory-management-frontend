import { apiClient } from "@/lib/apiClient"
import { CategoryResponse, CategoryRequest } from "@/types/category"

const BASE_URL = "/categories"

interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface GetAllCategoriesParams {
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export const categoryService = {
  // Créer une catégorie (ADMIN, MANAGER)
  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    return apiClient.post<CategoryResponse>(`${BASE_URL}/create`, data)
  },

  // Récupérer toutes les catégories avec pagination (ALL ROLES)
  getAll: async (params?: GetAllCategoriesParams): Promise<PaginatedResponse<CategoryResponse>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append('pageNumber', params.page.toString())
    if (params?.size !== undefined) searchParams.append('pageSize', params.size.toString())
    if (params?.sort) searchParams.append('sortBy', params.sort)
    if (params?.direction) searchParams.append('sortOrder', params.direction)
    
    const queryString = searchParams.toString()
    const url = `${BASE_URL}/all${queryString ? `?${queryString}` : ''}`
    
    console.log('API Call:', { url, params, queryString })
    
    return apiClient.get<PaginatedResponse<CategoryResponse>>(url, {
      showErrorToast: false // Désactiver les toasts d'erreur pour cet endpoint
    })
  },

  // Récupérer les catégories avec pagination infinie
  getInfinite: async (pageParam: number = 0, size: number = 10): Promise<PaginatedResponse<CategoryResponse>> => {
    const searchParams = new URLSearchParams()
    searchParams.append('pageNumber', pageParam.toString())
    searchParams.append('pageSize', size.toString())
    
    const url = `${BASE_URL}/all?${searchParams.toString()}`
    
    return apiClient.get<PaginatedResponse<CategoryResponse>>(url, {
      showErrorToast: false
    })
  },

  // Récupérer une catégorie par ID (ALL ROLES)
  getById: async (id: number): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`${BASE_URL}/${id}`)
  },

  // Mettre à jour une catégorie (ADMIN, MANAGER)
  update: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    return apiClient.put<CategoryResponse>(`${BASE_URL}/${id}`, data)
  },

  // Supprimer une catégorie (ADMIN only)
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  // Récupérer une catégorie par entreprise (ALL ROLES)
  getByCompany: async (companyId: number): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`${BASE_URL}/by-company/${companyId}`)
  }
}