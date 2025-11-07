import { apiClient } from "@/lib/apiClient"
import { ClientResponse, ClientRequest } from "@/types/client"

const BASE_URL = "/clients"

interface PaginatedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface GetAllClientsParams {
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export const clientService = {

  create: async (data: ClientRequest): Promise<ClientResponse> => {
    console.log('ClientService - Creating with data:', JSON.stringify(data, null, 2))
    return apiClient.post<ClientResponse>(`${BASE_URL}/create`, data)
  },


  getAll: async (params?: GetAllClientsParams): Promise<PaginatedResponse<ClientResponse>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append('pageNumber', params.page.toString())
    if (params?.size !== undefined) searchParams.append('pageSize', params.size.toString())
    if (params?.sort) searchParams.append('sortBy', params.sort)
    if (params?.direction) searchParams.append('sortOrder', params.direction)
    
    const queryString = searchParams.toString()
    const url = queryString ? `${BASE_URL}/all?${queryString}` : `${BASE_URL}/all`
    
    console.log('API Call:', { url, params, queryString })
    
    return apiClient.get<PaginatedResponse<ClientResponse>>(url, {
      showErrorToast: false 
    })
  },

  getInfinite: async (pageParam: number = 0, size: number = 10): Promise<PaginatedResponse<ClientResponse>> => {
    const searchParams = new URLSearchParams()
    searchParams.append('pageNumber', pageParam.toString())
    searchParams.append('pageSize', size.toString())
    
    const url = `${BASE_URL}/all?${searchParams.toString()}`
    
    return apiClient.get<PaginatedResponse<ClientResponse>>(url, {
      showErrorToast: false
    })
  },

  getById: async (id: number): Promise<ClientResponse> => {
    return apiClient.get<ClientResponse>(`${BASE_URL}/${id}`)
  },


  update: async (id: number, data: ClientRequest): Promise<ClientResponse> => {
    return apiClient.put<ClientResponse>(`${BASE_URL}/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  }
}

