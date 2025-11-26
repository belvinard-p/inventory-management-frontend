import { apiClient } from "@/lib/apiClient"
import { SupplierOrder, SupplierOrderRequest, OrderStatus } from "@/types/supplier/supplierOrder"

const BASE_URL = "/supplier-orders"

export const supplierOrderService = {

    create: async (data: SupplierOrderRequest): Promise<SupplierOrder> => {
        console.log('SupplierOrderService - Creating with data:', JSON.stringify(data, null, 2))
        return apiClient.post<SupplierOrder>(`${BASE_URL}/create`, data)
    },

    getById: async (id: number): Promise<SupplierOrder> => {
        return apiClient.get<SupplierOrder>(`${BASE_URL}/${id}`)
    },

    update: async (id: number, data: SupplierOrderRequest): Promise<SupplierOrder> => {
        return apiClient.put<SupplierOrder>(`${BASE_URL}/${id}`, data)
    },

    delete: async (id: number): Promise<void> => {
        return apiClient.delete(`${BASE_URL}/${id}`)
    },

    updateOrderStatus: async (id: number, status: OrderStatus): Promise<SupplierOrder> => {
        return apiClient.patch<SupplierOrder>(`${BASE_URL}/${id}/status?status=${status}`)
    },

    getAllOrders: async (): Promise<SupplierOrder[]> => {
        return apiClient.get<SupplierOrder[]>(`${BASE_URL}/all`)
    },

    cancelOrder: async (id: number): Promise<SupplierOrder> => {
        return apiClient.patch<SupplierOrder>(`${BASE_URL}/${id}/cancel`)
    },

    findByCode: async (code: string): Promise<SupplierOrder> => {
        return apiClient.get<SupplierOrder>(`${BASE_URL}/code/${code}`)
    }
}
