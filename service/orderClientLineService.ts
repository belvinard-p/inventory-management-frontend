import { apiClient } from "@/lib/apiClient"
import { OrderClientLineResponse, OrderClientLineRequest } from "@/types/orderClientLine"

const BASE_URL = "/order-lines"

export const orderClientLineService = {

  create: async (data: OrderClientLineRequest): Promise<OrderClientLineResponse> => {
    console.log('OrderClientLineService - Creating with data:', JSON.stringify(data, null, 2))
    return apiClient.post<OrderClientLineResponse>(`${BASE_URL}/create`, data)
  },

  getById: async (id: number): Promise<OrderClientLineResponse> => {
    return apiClient.get<OrderClientLineResponse>(`${BASE_URL}/${id}`)
  },

  getAllLinesForOrder: async (clientOrderId: number): Promise<OrderClientLineResponse[]> => {
    return apiClient.get<OrderClientLineResponse[]>(`${BASE_URL}/order/${clientOrderId}`)
  },

  updateLineQuantity: async (id: number, quantity: number): Promise<OrderClientLineResponse> => {
    return apiClient.patch<OrderClientLineResponse>(`${BASE_URL}/${id}/quantity?newQuantity=${quantity}`)
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  calculateTotal: async (clientOrderId: number): Promise<number> => {
    return apiClient.get<number>(`${BASE_URL}/order/${clientOrderId}/total`)
  }
}

