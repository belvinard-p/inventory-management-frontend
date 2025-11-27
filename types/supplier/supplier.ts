import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "../common";
import type { SupplierOrder } from "./supplierOrder";

// Type principal Supplier (basé sur SupplierResponseDto)
export type Supplier = {
    id: number;
    name: string;
    phoneNumber?: string;
    supplierOrders?: SupplierOrder[];
    createdAt: string;
    updatedAt: string;
}

// Type pour créer/modifier un supplier (basé sur SupplierRequestDto)
export interface SupplierRequest {
    name: string;
    phoneNumber?: string;
    companyId: number;
}

// Types pour les mutations
export type CreateSupplierMutation = UseMutationResult<Supplier, ApiError, SupplierRequest, unknown>;
export type UpdateSupplierMutation = UseMutationResult<Supplier, ApiError, { id: number; data: SupplierRequest }, unknown>;
export type DeleteSupplierMutation = UseMutationResult<unknown, ApiError, number, unknown>;

// Type pour la mise à jour partielle
export interface UpdateSupplierRequest extends Partial<SupplierRequest> {
    id: number;
}

// Alias pour compatibilité
export type SupplierResponse = Supplier;
