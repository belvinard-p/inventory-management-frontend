import { apiClient } from "@/lib/apiClient"
import { ClientOrderResponse, ClientOrderRequest, OrderStatus } from "@/types/clientOrder"

const BASE_URL = "/orders"

export const clientOrderService = {

  create: async (data: ClientOrderRequest): Promise<ClientOrderResponse> => {
    console.log('ClientOrderService - Creating with data:', JSON.stringify(data, null, 2))
    return apiClient.post<ClientOrderResponse>(`${BASE_URL}/create`, data)
  },

  getById: async (id: number): Promise<ClientOrderResponse> => {
    return apiClient.get<ClientOrderResponse>(`${BASE_URL}/${id}`)
  },

  update: async (id: number, data: ClientOrderRequest): Promise<ClientOrderResponse> => {
    return apiClient.put<ClientOrderResponse>(`${BASE_URL}/${id}`, data)
  },

  getOrdersByClient: async (clientId: number): Promise<ClientOrderResponse[]> => {
    return apiClient.get<ClientOrderResponse[]>(`${BASE_URL}/client/${clientId}`)
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`${BASE_URL}/${id}`)
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<ClientOrderResponse> => {
    return apiClient.patch<ClientOrderResponse>(`${BASE_URL}/${id}/status?status=${status}`)
  },

  getOrdersByStatus: async (status: OrderStatus): Promise<ClientOrderResponse[]> => {
    return apiClient.get<ClientOrderResponse[]>(`${BASE_URL}/status/${status}`)
  },

  getAllOrders: async (): Promise<ClientOrderResponse[]> => {
    return apiClient.get<ClientOrderResponse[]>(`${BASE_URL}/all`)
  },

  cancelOrder: async (id: number): Promise<ClientOrderResponse> => {
    return apiClient.patch<ClientOrderResponse>(`${BASE_URL}/${id}/cancel`)
  }
}

