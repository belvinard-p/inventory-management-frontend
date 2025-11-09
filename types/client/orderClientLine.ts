import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "../common";

export type OrderClientLine = {
  id: number;
  quantity: number;
  unitPrice: number;           // Prix unitaire (correspond au backend)
  totalPrice: number;          // Prix total de la ligne (correspond au backend)
  clientOrderId: number;       // ID de la commande client
  articleId: number;
  articleDesignation: string;
  articleCode: string;
  // Champs optionnels si votre backend les retourne aussi
  unitPriceExclTax?: number;
  rateTva?: number;
  unitPriceAllTax?: number;
  totalLinePrice?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface OrderClientLineRequest {
  clientOrderId: number;
  articleId: number;
  quantity: number;
}

export type CreateOrderClientLineMutation = UseMutationResult<OrderClientLine, ApiError, OrderClientLineRequest, unknown>;
export type UpdateOrderClientLineMutation = UseMutationResult<OrderClientLine, ApiError, { id: number; quantity: number }, unknown>;
export type DeleteOrderClientLineMutation = UseMutationResult<unknown, ApiError, number, unknown>;

export interface UpdateOrderClientLineRequest {
    id: number;
    quantity: number;
}

export type OrderClientLineResponse = OrderClientLine;