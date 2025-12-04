import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "../common";

export type SupplierOrderLine = {
    id: number;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    supplierOrderId: number;
    supplierId: number;
    articleId: number;
    articleDesignation: string;
    articleCode: string;
    supplierName?: string;

    unitPriceExclTax: number;
    rateTva: number;
    unitPriceAllTax: number;
    totalLinePrice: number;
    createdDate: string;
    updatedDate: string;
}

export interface SupplierOrderLineRequest {
    supplierOrderId: number;
    articleId: number;
    quantity: number;
}

export type CreateSupplierOrderLineMutation = UseMutationResult<SupplierOrderLine, ApiError, SupplierOrderLineRequest, unknown>;
export type UpdateSupplierOrderLineMutation = UseMutationResult<SupplierOrderLine, ApiError, { id: number; quantity: number }, unknown>;
export type DeleteSupplierOrderLineMutation = UseMutationResult<unknown, ApiError, number, unknown>;

export interface UpdateSupplierOrderLineRequest {
    id: number;
    quantity: number;
}

