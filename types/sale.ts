import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";

export enum SaleStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

// Type pour les lignes de vente (basé sur SaleLineResponseDto)
export type SaleLine = {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  articleId: number;
  articleCode: string;
  articleDesignation: string;
}

// Type principal Sale (basé sur SaleResponseDto)
export type Sale = {
  id: number;
  code: string;
  comments?: string;
  saleDate: string;
  status: SaleStatus;
  clientName: string;
  clientOrderId: number;
  clientOrderCode: string;
  saleLines?: SaleLine[];
}

// Type pour créer/modifier une vente (basé sur SaleRequestDto)
export interface SaleRequest {
  comments?: string;
  saleDate: string;
  status: SaleStatus;
  clientId: number;
  clientOrderId: number;
}

// Types pour les mutations
export type CreateSaleMutation = UseMutationResult<Sale, ApiError, SaleRequest, unknown>;
export type UpdateSaleMutation = UseMutationResult<Sale, ApiError, { id: number; data: SaleRequest }, unknown>;
export type DeleteSaleMutation = UseMutationResult<unknown, ApiError, number, unknown>;
export type UpdateSaleStatusMutation = UseMutationResult<Sale, ApiError, { id: number; status: SaleStatus }, unknown>;
export type CancelSaleMutation = UseMutationResult<Sale, ApiError, number, unknown>;
export type FinalizeSaleMutation = UseMutationResult<Sale, ApiError, number, unknown>;
export type GenerateSaleLinesMutation = UseMutationResult<Sale, ApiError, number, unknown>;

// Type pour la mise à jour partielle
export interface UpdateSaleRequest extends Partial<SaleRequest> {
    id: number;
}

// Alias pour compatibilité
export type SaleResponse = Sale;