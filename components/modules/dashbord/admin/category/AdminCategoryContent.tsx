"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "./DataTable"
import { CategoryResponse } from "@/types/category"
import { columns } from "./Columns"
import { CategoryForm } from "./CategoryForm"

interface AdminCategoryContentProps {
  categories: CategoryResponse[]
  totalItems: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasPermission: boolean
  isAuthenticated: boolean
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
}

export function AdminCategoryContent({
  categories,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  hasPermission,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: AdminCategoryContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de produits et leurs informations
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Catégorie
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

      <CategoryForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
    </div>
  )
}