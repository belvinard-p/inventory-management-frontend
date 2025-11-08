"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, FolderOpen, CheckCircle, XCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DataTable } from "./DataTable"
import { CategoryResponse } from "@/types/category"
import { createColumns } from "./Columns"
import { CategoryForm } from "./CategoryForm"
import { DeleteConfirmDialog } from "@/components/global/DeleteConfirmDialog"
import { useCategories } from "@/hooks/category/useCategory"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminCategoryContentProps {
  categories: CategoryResponse[]
  categoriesPaginated: { totalPages: number; totalElements: number } | null | undefined
  currentPage: number
  setCurrentPage: (page: number) => void
  hasPermission: boolean
  isAuthenticated: boolean
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  stats: {
    readonly total: number
    readonly active: number
    readonly inactive: number
  }
  setFilteredCategories: (categories: CategoryResponse[]) => void
  setHasFilter: (hasFilter: boolean) => void
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-${colorClass}/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-${colorClass}/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
        <CardTitle className={`text-xs sm:text-sm font-medium group-hover:text-${colorClass} transition-colors duration-300 truncate`}>{title}</CardTitle>
        <div className={`group-hover:scale-110 group-hover:text-${colorClass} transition-all duration-300 flex-shrink-0`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className={`text-xl sm:text-2xl font-bold text-${colorClass} group-hover:scale-105 transition-transform duration-300`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function CategorySearch({ data, onFilteredData, placeholder }: {
  readonly data: CategoryResponse[]
  readonly onFilteredData: (filtered: CategoryResponse[], hasFilter?: boolean) => void
  readonly placeholder: string
}) {
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    if (!searchTerm.trim()) {
      onFilteredData(data, false)
      return
    }

    const filtered = data.filter(category => 
      category.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    onFilteredData(filtered, true)
  }, [searchTerm, data, onFilteredData])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

function PaginationComponent({ categories, currentPage, setCurrentPage }: {
  readonly categories: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!categories || categories.totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        <span className="hidden sm:inline">Page {currentPage + 1} sur {categories.totalPages} ({categories.totalElements} catégories)</span>
        <span className="sm:hidden">{currentPage + 1}/{categories.totalPages}</span>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(categories.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (categories.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > categories.totalPages - 4) {
                pageIndex = categories.totalPages - 5 + i
              } else {
                pageIndex = currentPage - 2 + i
              }
            }
            
            return (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  onClick={() => setCurrentPage(pageIndex)}
                  isActive={currentPage === pageIndex}
                  className="cursor-pointer"
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(categories.totalPages - 1, currentPage + 1))}
              className={currentPage === categories.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminCategoryContent({
  categories,
  categoriesPaginated,
  currentPage,
  setCurrentPage,
  hasPermission,
  isCreateModalOpen,
  setIsCreateModalOpen,
  stats,
  setFilteredCategories,
  setHasFilter,
}: AdminCategoryContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryResponse | undefined>()
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const { deleteCategory, isDeleting } = useCategories()

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleDelete = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleDetails = (category: CategoryResponse) => {
    setSelectedCategory(category)
    setIsDetailsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory.mutateAsync(selectedCategory.id)
        setIsDeleteDialogOpen(false)
        setSelectedCategory(undefined)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const columns = createColumns({ onEdit: handleEdit, onDelete: handleDelete, onDetails: handleDetails })
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

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<FolderOpen className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Actives" 
          value={stats.active} 
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
        <StatsCard 
          title="Inactives" 
          value={stats.inactive} 
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          colorClass="red-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Liste des Catégories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CategorySearch 
              data={categories}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredCategories(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Rechercher catégorie"
            />
          </div>
          
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={categories}
              enablePagination={false}
            />
          </div>
          
          <PaginationComponent 
            categories={categoriesPaginated}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      <CategoryForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />

      <CategoryForm
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        category={selectedCategory}
      />

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la catégorie</DialogTitle>
            <DialogDescription>Cliquez en dehors du dialogue pour fermer.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-2 py-2 text-base">
              <div><strong>Code:</strong> {selectedCategory.code}</div>
              <div><strong>Désignation:</strong> {selectedCategory.designation}</div>
              <div><strong>Date de création:</strong> {selectedCategory.createdDate}</div>
              <div><strong>Dernière mise à jour:</strong> {selectedCategory.updatedDate}</div>
              {/* Ajoutez d'autres champs au besoin */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={selectedCategory?.designation}
        isLoading={isDeleting}
      />
    </div>
  )
}