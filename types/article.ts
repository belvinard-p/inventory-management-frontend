import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";

// Article Status enum - matches the Java enum
export enum ArticleStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED"
}

// Base types
export interface ArticleResponse {
  id: number;
  codeArticle: string;
  designation: string;
  quantityInStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitPriceExclTax: number;
  rateTva: number;
  unitPriceAllTax: number;
  image?: string;
  categoryId: number;
  status: ArticleStatus;
  categoryDesignation: string;
  createdDate: string; // ISO date string
  updatedDate: string; // ISO date string
}

export interface ArticleRequest {
  codeArticle: string;
  designation: string;
  quantityInStock: number;
  unitPriceExclTax: number;
  rateTva: number;
  image?: string;
  categoryId: number;
}

// For list responses
export interface ArticleListResponse {
  content: ArticleResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// For pagination/filtering
export interface ArticleQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  categoryId?: number;
  status?: ArticleStatus;
  minPrice?: number;
  maxPrice?: number;
}

// For inventory operations
export interface UpdateStockRequest {
  articleId: number;
  quantity: number;
  type: 'ADD' | 'REMOVE' | 'SET';
  reason?: string;
}

// Mutation types
export type CreateArticleMutation = UseMutationResult<
  ArticleResponse,
  ApiError,
  ArticleRequest
>;

export type UpdateArticleMutation = UseMutationResult<
  ArticleResponse,
  ApiError,
  { id: number; data: Partial<ArticleRequest> }
>;

export type DeleteArticleMutation = UseMutationResult<void, ApiError, number>;

export type UpdateStockMutation = UseMutationResult<
  ArticleResponse,
  ApiError,
  UpdateStockRequest
>;

// Type for the update request (partial updates)
export type UpdateArticleRequest = {
  id: number;
  data: Partial<ArticleRequest>;
};

// For select/dropdown options
export interface ArticleOption {
  value: number;
  label: string;
  code: string;
  stock: number;
  price: number;
}

// Type guard
export function isArticleResponse(data: unknown): data is ArticleResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'codeArticle' in data &&
    'designation' in data
  );
}

// Helper to convert article to select option
export const toArticleOption = (article: ArticleResponse): ArticleOption => ({
  value: article.id,
  label: article.designation,
  code: article.codeArticle,
  stock: article.availableQuantity,
  price: article.unitPriceAllTax,
});

// Helper to calculate total price for an article
export const calculateArticleTotal = (article: ArticleResponse, quantity: number): number => {
  return article.unitPriceAllTax * quantity;
};

// Helper to check if article is low in stock
export const isLowStock = (article: ArticleResponse, threshold: number = 10): boolean => {
  return article.availableQuantity <= threshold;
};