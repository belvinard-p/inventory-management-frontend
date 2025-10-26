"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "./DataTable"
import { CategoryResponse } from "@/types/category"
import { columns } from "./Columns"

interface AdminCategoryContentProps {
  categories: CategoryResponse[]
  totalItems: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onEditCategory: (category: CategoryResponse) => void
  onDeleteCategory: (id: string) => void
  onCreateCategory: () => void
  hasPermission: boolean
  isAuthenticated: boolean
  hasFilter: boolean
}

export function AdminCategoryContent({
  categories,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  onEditCategory,
  onDeleteCategory,
  onCreateCategory,
  hasPermission,
  isAuthenticated,
  hasFilter,
}: AdminCategoryContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        {hasPermission && (
          <Button onClick={onCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={categories}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
