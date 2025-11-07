import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";

export type OrderClientLine = {
  id: number;
  articleId: number;
  articleCode: string;
  articleDesignation: string;
  unitPriceExclTax: number;
  rateTva: number;
  unitPriceAllTax: number;
  quantity: number;
  totalLinePrice: number;
  createdDate: string;
  updatedDate: string;
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

