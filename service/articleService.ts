import { apiClient } from "@/lib/apiClient"
import { ArticleResponse, ArticleRequest } from "@/types/article"

const BASE_URL = "/articles"

interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface GetAllArticlesParams {
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export const articleService = {
  // Créer un article (ADMIN, MANAGER)
  create: async (data: ArticleRequest): Promise<ArticleResponse> => {
    console.log('ArticleService - Creating with data:', JSON.stringify(data, null, 2))
    return apiClient.post<ArticleResponse>(`${BASE_URL}/create`, data)
  },

  // Récupérer tous les articles avec pagination (ALL ROLES)
  getAll: async (params?: GetAllArticlesParams): Promise<PaginatedResponse<ArticleResponse>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append('pageNumber', params.page.toString())
    if (params?.size !== undefined) searchParams.append('pageSize', params.size.toString())
    if (params?.sort) searchParams.append('sortBy', params.sort)
    if (params?.direction) searchParams.append('sortOrder', params.direction)
    
    const queryString = searchParams.toString()
    const url = `${BASE_URL}/all${queryString ? `?${queryString}` : ''}`
    
    console.log('API Call:', { url, params, queryString })
    
    return apiClient.get<PaginatedResponse<ArticleResponse>>(url, {
      showErrorToast: false // Désactiver les toasts d'erreur pour cet endpoint
    })
  },

  // Récupérer les articles avec pagination infinie
  getInfinite: async (pageParam: number = 0, size: number = 10): Promise<PaginatedResponse<ArticleResponse>> => {
    const searchParams = new URLSearchParams()
    searchParams.append('pageNumber', pageParam.toString())
    searchParams.append('pageSize', size.toString())
    
    const url = `${BASE_URL}/all?${searchParams.toString()}`
    
    return apiClient.get<PaginatedResponse<ArticleResponse>>(url, {
      showErrorToast: false
    })
  },

  // Récupérer un article par ID (ALL ROLES)
  getById: async (id: number): Promise<ArticleResponse> => {
    return apiClient.get<ArticleResponse>(`${BASE_URL}/${id}`)
  },

  // Mettre à jour un article (ADMIN, MANAGER)
  update: async (id: number, data: ArticleRequest): Promise<ArticleResponse> => {
    return apiClient.put<ArticleResponse>(`${BASE_URL}/update/${id}`, data)
  },

  // Supprimer un article (ADMIN only)
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  // Récupérer un article par code (ALL ROLES)
  getByCode: async (code: string): Promise<ArticleResponse> => {
    return apiClient.get<ArticleResponse>(`${BASE_URL}/code/${code}`)
  },

  // Récupérer les articles archivés (ALL ROLES)
  getArchived: async (): Promise<ArticleResponse[]> => {
    return apiClient.get<ArticleResponse[]>(`${BASE_URL}/archived`)
  },

  // Restaurer un article archivé (ADMIN, MANAGER)
  restore: async (id: number): Promise<ArticleResponse> => {
    return apiClient.put<ArticleResponse>(`${BASE_URL}/${id}/restore`)
  },

  // Récupérer l'URL de l'image d'un article (ALL ROLES)
  getImageUrl: async (id: number, expirationMinutes: number = 15): Promise<string> => {
    return apiClient.get<string>(`${BASE_URL}/${id}/image_url?expirationMinutes=${expirationMinutes}`)
  },

  // Uploader l'image d'un article (ADMIN, MANAGER)
  uploadImage: async (id: number, imageFile: File): Promise<void> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    // Don't set Content-Type header manually for FormData, let the browser set it
    return apiClient.put<void>(`${BASE_URL}/${id}/image`, formData)
  }
}

