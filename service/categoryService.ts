import { apiClient } from "@/lib/apiClient"
import { CategoryResponse, CategoryRequest } from "@/types/category"
import { ArticleResponse } from "@/types/article"

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
  companyId?: number
}

export const categoryService = {
  // Create a new category (ADMIN, MANAGER)
  create: async (data: CategoryRequest): Promise<CategoryResponse> => {
    console.log('Creating category with data:', JSON.stringify(data, null, 2))
    try {
      const result = await apiClient.post<CategoryResponse>(`${BASE_URL}/create`, data)
      console.log('Category created successfully:', result)
      return result
    } catch (error) {
      console.error('Category creation failed:', error)
      throw error
    }
  },

  // Get all categories with pagination (ALL ROLES)
  getAll: async (params?: GetAllCategoriesParams): Promise<PaginatedResponse<CategoryResponse>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append('pageNumber', params.page.toString())
    if (params?.size !== undefined) searchParams.append('pageSize', params.size.toString())
    if (params?.sort) searchParams.append('sortBy', params.sort)
    if (params?.direction) searchParams.append('sortOrder', params.direction)
    // Only add companyId if it's explicitly provided and not undefined
    if (params?.companyId !== undefined && params?.companyId !== null) {
      searchParams.append('companyId', params.companyId.toString())
    }
    
    const queryString = searchParams.toString()
    const url = `${BASE_URL}/all${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<PaginatedResponse<CategoryResponse>>(url, {
      showErrorToast: false
    })
  },

  // Get categories with infinite pagination
  getInfinite: async (pageParam: number = 0, size: number = 10, companyId?: number): Promise<PaginatedResponse<CategoryResponse>> => {
    const searchParams = new URLSearchParams()
    searchParams.append('pageNumber', pageParam.toString())
    searchParams.append('pageSize', size.toString())
    if (companyId !== undefined) searchParams.append('companyId', companyId.toString())
    
    return apiClient.get<PaginatedResponse<CategoryResponse>>(
      `${BASE_URL}/all?${searchParams.toString()}`
    )
  },

  // Get a category by ID (ALL ROLES)
  getById: (id: number): Promise<CategoryResponse> => {
    return apiClient.get<CategoryResponse>(`${BASE_URL}/${id}`)
  },

  // Update a category (ADMIN, MANAGER)
  update: (id: number, data: Partial<CategoryRequest>): Promise<CategoryResponse> => {
    return apiClient.put<CategoryResponse>(`${BASE_URL}/${id}`, data)
  },

  // Delete a category (ADMIN only)
  delete: (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  // Get articles by category
  getArticlesByCategory: (categoryId: number): Promise<ArticleResponse[]> => {
    return apiClient.get<ArticleResponse[]>(`${BASE_URL}/${categoryId}/articles`)
  },

  // Get categories by company
  getByCompany: (companyId: number): Promise<CategoryResponse[]> => {
    return apiClient.get<CategoryResponse[]>(`${BASE_URL}/company/${companyId}`)
  }
}