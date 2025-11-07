import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "../common";
import type { OrderClientLine } from "./orderClientLine";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

export type ClientOrder = {
  id: number;
  code: string;
  orderDate: string;
  comments?: string;
  stateOrder: string;
  clientId: number;
  orderClientLineList?: OrderClientLine[];
  createdDate: string;
  updatedDate: string;
}

export interface ClientOrderRequest {
  code: string;
  orderDate: string;
  clientId: number;
  comments?: string;
  stateOrder: OrderStatus;
}

export type CreateClientOrderMutation = UseMutationResult<ClientOrder, ApiError, ClientOrderRequest, unknown>;
export type UpdateClientOrderMutation = UseMutationResult<ClientOrder, ApiError, { id: number; data: ClientOrderRequest }, unknown>;
export type DeleteClientOrderMutation = UseMutationResult<unknown, ApiError, number, unknown>;
export type UpdateOrderStatusMutation = UseMutationResult<ClientOrder, ApiError, { id: number; status: OrderStatus }, unknown>;
export type CancelOrderMutation = UseMutationResult<ClientOrder, ApiError, number, unknown>;

export interface UpdateClientOrderRequest extends Partial<ClientOrderRequest> {
    id: number;
}

export type ClientOrderResponse = ClientOrder;

