import { apiClient } from "@/lib/apiClient"
import { ClientOrderResponse } from "@/types/client/clientOrder"

export const clientOrderActions = {
  updateStatus: async (orderId: number, status: string): Promise<ClientOrderResponse> => {
    return apiClient.patch<ClientOrderResponse>(`/orders/${orderId}/status?status=${status}`)
  },

  cancelOrder: async (orderId: number): Promise<ClientOrderResponse> => {
    return apiClient.patch<ClientOrderResponse>(`/orders/${orderId}/cancel`)
  }
}