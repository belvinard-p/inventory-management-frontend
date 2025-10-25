import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError } from "./common";
import type { ArticleResponse } from "./article";

// Base types
export interface CategoryResponse {
    id: number;
    designation: string;
    code: string;
    companyId: number;
    description?: string;
    isActive?: boolean;
    image?: string;
    articles?: ArticleResponse[];
    createdDate: string; 
    updatedDate: string; 
}

export interface CategoryRequest {
    designation: string;
    code: string;
    companyId: number;
    description?: string;
    isActive?: boolean;
    image?: string;
}

// For list responses
export interface CategoryListResponse {
    content: CategoryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// For pagination/filtering
export interface CategoryQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    companyId?: number;
}

// Mutation types
export type CreateCategoryMutation = UseMutationResult<
    CategoryResponse,
    ApiError,
    CategoryRequest
>;

export type UpdateCategoryMutation = UseMutationResult<
    CategoryResponse,
    ApiError,
    { id: number; data: Partial<CategoryRequest> }
>;

export type DeleteCategoryMutation = UseMutationResult<void, ApiError, number>;

// Type for the update request (partial updates)
export type UpdateCategoryRequest = {
    id: number;
    data: Partial<Omit<CategoryRequest, 'companyId'>>; // companyId is typically not updated
};

// For select/dropdown options
export interface CategoryOption {
    value: number;
    label: string;
    code: string;
}

// Type guard
export function isCategoryResponse(data: unknown): data is CategoryResponse {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'designation' in data &&
        'code' in data
    );
}

// Helper to convert category to select option
export const toCategoryOption = (category: CategoryResponse): CategoryOption => ({
    value: category.id,
    label: category.designation,
    code: category.code,
});