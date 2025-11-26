import { apiClient } from "@/lib/apiClient"
import { SupplierOrderLine, SupplierOrderLineRequest } from "@/types/supplier/supplierOrderLine"

const BASE_URL = "/supplier-order-lines"

export const orderSupplierLineService = {

    create: async (data: SupplierOrderLineRequest): Promise<SupplierOrderLine> => {
        console.log('OrderSupplierLineService - Creating with data:', JSON.stringify(data, null, 2))
        return apiClient.post<SupplierOrderLine>(`${BASE_URL}/add`, data)
    },

    getById: async (id: number): Promise<SupplierOrderLine> => {
        return apiClient.get<SupplierOrderLine>(`${BASE_URL}/${id}`)
    },

    getAllLinesForOrder: async (supplierOrderId: number): Promise<SupplierOrderLine[]> => {
        return apiClient.get<SupplierOrderLine[]>(`${BASE_URL}/order/${supplierOrderId}`)
    },

    getAllLines: async (): Promise<SupplierOrderLine[]> => {
        return apiClient.get<SupplierOrderLine[]>(`${BASE_URL}/all`)
    },

    update: async (id: number, data: SupplierOrderLineRequest): Promise<SupplierOrderLine> => {
        return apiClient.put<SupplierOrderLine>(`${BASE_URL}/${id}`, data)
    },

    updateLineQuantity: async (id: number, quantity: number): Promise<SupplierOrderLine> => {
        return apiClient.patch<SupplierOrderLine>(`${BASE_URL}/${id}/quantity`, { quantity })
    },

    delete: async (id: number): Promise<void> => {
        return apiClient.delete(`${BASE_URL}/${id}`)
    },

    calculateTotal: async (supplierOrderId: number): Promise<number> => {
        const response = await apiClient.get<{ total: number }>(`${BASE_URL}/order/${supplierOrderId}/total`)
        return response.total
    }
}
