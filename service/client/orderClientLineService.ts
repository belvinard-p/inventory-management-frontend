import { apiClient } from "@/lib/apiClient"
import { OrderClientLineResponse, OrderClientLineRequest } from "@/types/client/orderClientLine"

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

  getAllLines: async (): Promise<OrderClientLineResponse[]> => {
    // Get all orders first, then extract all lines from them
    const orders = await apiClient.get<any[]>("/orders/all")
    
    const allLines: OrderClientLineResponse[] = []
    orders.forEach(order => {
      if (order.orderClientLineList && Array.isArray(order.orderClientLineList)) {
        // Add clientOrderId to each line
        const linesWithOrderId = order.orderClientLineList.map((line: any) => ({
          ...line,
          clientOrderId: order.id
        }))
        allLines.push(...linesWithOrderId)
      }
    })
    
    return allLines
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