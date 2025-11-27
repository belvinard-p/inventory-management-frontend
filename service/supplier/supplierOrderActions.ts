import { apiClient } from "@/lib/apiClient"
import { SupplierOrder } from "@/types/supplier/supplierOrder"

export const supplierOrderActions = {
    updateStatus: async (orderId: number, status: string): Promise<SupplierOrder> => {
        return apiClient.patch<SupplierOrder>(`/supplier-orders/${orderId}/status?status=${status}`)
    },

    cancelOrder: async (orderId: number): Promise<SupplierOrder> => {
        return apiClient.patch<SupplierOrder>(`/supplier-orders/${orderId}/cancel`)
    }
}
