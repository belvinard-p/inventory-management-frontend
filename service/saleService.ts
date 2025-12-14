import { apiClient } from "@/lib/apiClient"
import { Sale, SaleRequest, SaleStatus } from "@/types/sale"

const BASE_URL = "/sales"

export const saleService = {

  create: async (data: SaleRequest): Promise<Sale> => {
    console.log('SaleService - Creating with data:', JSON.stringify(data, null, 2))
    return apiClient.post<Sale>(`${BASE_URL}/create`, data)
  },

  getAll: async (): Promise<Sale[]> => {
    return apiClient.get<Sale[]>(`${BASE_URL}`, {
      showErrorToast: false 
    })
  },

  getById: async (id: number): Promise<Sale> => {
    return apiClient.get<Sale>(`${BASE_URL}/${id}`)
  },

  update: async (id: number, data: SaleRequest): Promise<Sale> => {
    return apiClient.put<Sale>(`${BASE_URL}/${id}`, data)
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  updateStatus: async (id: number, status: SaleStatus): Promise<Sale> => {
    return apiClient.patch<Sale>(`${BASE_URL}/${id}/status?status=${status}`)
  },

  cancel: async (id: number): Promise<Sale> => {
    return apiClient.patch<Sale>(`${BASE_URL}/${id}/cancel`)
  },

  finalize: async (id: number): Promise<Sale> => {
    return apiClient.patch<Sale>(`${BASE_URL}/${id}/finalize`)
  },

  generateSaleLines: async (id: number): Promise<Sale> => {
    return apiClient.post<Sale>(`${BASE_URL}/${id}/generate-lines`)
  }
}