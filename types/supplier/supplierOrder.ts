import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "../common";
import type { SupplierOrderLine } from "./supplierOrderLine"

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

export type SupplierOrder = {
    id: number;
    code: string;
    orderDate: string;
    comments?: string;
    stateOrder: string;
    supplierId: number;
    supplierName?: string;  // Nom du fournisseur (retourné par le backend)
    supplierOrderLineList?: SupplierOrderLine[];
    createdAt: string;
    updatedAt: string;
}

export interface SupplierOrderRequest {
    code: string;
    orderDate: string;
    supplierId: number;
    comments?: string;
    stateOrder: string;
}

export type CreateSupplierOrderMutation = UseMutationResult<SupplierOrder, ApiError, SupplierOrderRequest, unknown>;
export type UpdateSupplierOrderMutation = UseMutationResult<SupplierOrder, ApiError, { id: number; data: SupplierOrderRequest }, unknown>;
export type DeleteSupplierOrderMutation = UseMutationResult<unknown, ApiError, number, unknown>;
export type UpdateOrderStatusMutation = UseMutationResult<SupplierOrder, ApiError, { id: number; status: OrderStatus }, unknown>;
export type CancelOrderMutation = UseMutationResult<SupplierOrder, ApiError, number, unknown>;

export interface UpdateSupplierOrderRequest extends Partial<SupplierOrderRequest> {
    id: number;
}
