import { apiClient } from "@/lib/apiClient"
import { Supplier, SupplierRequest } from "@/types/supplier/supplier"

const BASE_URL = "/suppliers"

export const supplierService = {

    create: async (data: SupplierRequest): Promise<Supplier> => {
        console.log('SupplierService - Creating with data:', JSON.stringify(data, null, 2))
        return apiClient.post<Supplier>(`${BASE_URL}/create`, data)
    },

    getAll: async (): Promise<Supplier[]> => {
        console.log('SupplierService - Getting all suppliers')
        return apiClient.get<Supplier[]>(`${BASE_URL}/all`, {
            showErrorToast: false
        })
    },

    getById: async (id: number): Promise<Supplier> => {
        return apiClient.get<Supplier>(`${BASE_URL}/${id}`)
    },

    update: async (id: number, data: SupplierRequest): Promise<Supplier> => {
        return apiClient.put<Supplier>(`${BASE_URL}/${id}`, data)
    },

    delete: async (id: number): Promise<void> => {
        return apiClient.delete(`${BASE_URL}/${id}`)
    }
}
