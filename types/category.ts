import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";
import type { ArticleResponse } from "./article";

// Type principal Category (basé sur CategoryResponseDto)
export type Category = {
    id: number;
    designation: string;
    code: string;
    articles?: ArticleResponse[];
    createdDate: string; 
    updatedDate: string; 
    companyId?: number;
    isActive?: boolean;
}

// Type pour créer/modifier une category (basé sur CategoryRequestDto)
export interface CategoryRequest {
    designation: string;
    code: string;
    companyId: number;
}

// Types pour les mutations
export type CreateCategoryMutation = UseMutationResult<Category, ApiError, CategoryRequest, unknown>;
export type UpdateCategoryMutation = UseMutationResult<Category, ApiError, { id: number; data: CategoryRequest }, unknown>;
export type DeleteCategoryMutation = UseMutationResult<unknown, ApiError, number, unknown>;

// Type pour la mise à jour partielle
export interface UpdateCategoryRequest extends Partial<CategoryRequest> {
    id: number;
}

// Alias pour compatibilité
export type CategoryResponse = Category;
