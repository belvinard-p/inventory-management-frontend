import { UseMutationResult } from "@tanstack/react-query";
import { AddressDto } from "./common";
import type { ApiError } from "./common";

// Types pour Category et Supplier (références)
export interface CategoryResponse {
    id: number;
    name: string;
}

export interface SupplierResponse {
    id: number;
    name: string;
}

// Type principal Company (basé sur CompanyResponseDto)
export type Company = {
    id: number;
    name: string;
    description: string;
    address: AddressDto;
    fiscalCode: string;
    image?: string;
    email: string;
    phoneNumber: string;
    website?: string;
    createdAt: string;
    updatedAt: string;
    categories?: CategoryResponse[];
    suppliers?: SupplierResponse[];
}

// Type pour créer/modifier une company (basé sur CompanyRequestDto)
export interface CompanyRequest {
    name: string;
    description: string;
    address: AddressDto;
    fiscalCode: string;
    image?: string;
    email: string;
    phoneNumber: string;
    website?: string;
}

// Types pour les mutations
export type CreateCompanyMutation = UseMutationResult<Company, ApiError, CompanyRequest, unknown>;
export type UpdateCompanyMutation = UseMutationResult<Company, ApiError, { id: number; data: CompanyRequest }, unknown>;
export type DeleteCompanyMutation = UseMutationResult<unknown, ApiError, number, unknown>;

// Type pour la mise à jour partielle
export interface UpdateCompanyRequest extends Partial<CompanyRequest> {
    id: number;
}