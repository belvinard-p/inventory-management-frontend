import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";

export enum ArticleStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED"
}


export type Article = {
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
  createdDate: string;
  updatedDate: string; 
}

export interface ArticleRequest {
  codeArticle: string;
  designation: string;
  quantityInStock?: number;
  unitPriceExclTax: number;
  rateTva: number;
  categoryId: number;
  image?: string;
}

export type CreateArticleMutation = UseMutationResult<Article, ApiError, ArticleRequest, unknown>;
export type UpdateArticleMutation = UseMutationResult<Article, ApiError, { id: number; data: ArticleRequest }, unknown>;
export type DeleteArticleMutation = UseMutationResult<unknown, ApiError, number, unknown>;

export interface UpdateArticleRequest extends Partial<ArticleRequest> {
    id: number;
}

export type ArticleResponse = Article;