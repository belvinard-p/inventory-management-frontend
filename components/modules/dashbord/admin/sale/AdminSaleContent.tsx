"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SaleProvider } from "./SaleContext"
import { SaleSearch } from "./SaleSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../company/DataTable"
import { createColumns } from "./Columns"
import { EmptyState } from "@/components/global"
import { SaleForm } from "./SaleForm"
import { SaleDetailsDialog } from "./SaleDetailsDialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Sale, SaleRequest, SaleStatus } from "@/types/sale"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminSaleContentProps {
  readonly currentUser: { roleName: string } | null
  readonly salesData: Sale[]
  readonly displayData: Sale[]
  readonly stats: {
    readonly total: number
    readonly draft: number
    readonly confirmed: number
    readonly cancelled: number
  }
  readonly sales: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly selectedSales: Sale[]
  readonly isCreateModalOpen: boolean
  readonly editingSale: Sale | null
  readonly selectedSale: Sale | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly setFilteredSales: (sales: Sale[]) => void
  readonly setHasFilter: (hasFilter: boolean) => void
  readonly handleEditSale: (sale: Sale) => void
  readonly handleRowSelectionChange: (selection: unknown) => void
  readonly clearSelection: () => void
  readonly setCurrentPage: (page: number) => void
  readonly setEditingSale: (sale: Sale | null) => void
  readonly setSelectedSale: (sale: Sale | null) => void
  readonly handleDelete: (id: number) => Promise<void>
  readonly handleUpdateStatus: (id: number, status: SaleStatus) => Promise<void>
  readonly handleCancel: (id: number) => Promise<void>
  readonly handleBulkDelete: (ids: number[]) => Promise<void>
  readonly handleBulkUpdateStatus: (ids: number[], status: SaleStatus) => Promise<void>
  readonly handleBulkCancel: (ids: number[]) => Promise<void>
  readonly handleFormSubmit: (data: SaleRequest) => Promise<void>
  readonly handleSaleUpdate: () => void
  readonly isLoading: boolean
  readonly isFormLoading: boolean
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
        <CardTitle className="text-xs sm:text-sm font-medium truncate">{title}</CardTitle>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function PaginationComponent({ sales, currentPage, setCurrentPage }: {
  readonly sales: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!sales || sales.totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        <span className="hidden sm:inline">Page {currentPage + 1} sur {sales.totalPages} ({sales.totalElements} ventes)</span>
        <span className="sm:hidden">{currentPage + 1}/{sales.totalPages}</span>
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
          
          {Array.from({ length: Math.min(sales.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (sales.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > sales.totalPages - 4) {
                pageIndex = sales.totalPages - 5 + i
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
              onClick={() => setCurrentPage(Math.min(sales.totalPages - 1, currentPage + 1))}
              className={currentPage === sales.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminSaleContent({
  currentUser,
  salesData,
  displayData,
  stats,
  sales,
  currentPage,
  selectedSales,
  isCreateModalOpen,
  editingSale,
  selectedSale,
  setIsCreateModalOpen,
  setFilteredSales,
  setHasFilter,
  handleEditSale,
  handleRowSelectionChange,
  clearSelection,
  setCurrentPage,
  setEditingSale,
  setSelectedSale,
  handleDelete,
  handleUpdateStatus,
  handleCancel,
  handleBulkDelete,
  handleBulkUpdateStatus,
  handleBulkCancel,
  handleSaleUpdate,
  isLoading,
}: AdminSaleContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_SALES'
  
  // Create columns with handlers
  const columns = createColumns({
    onEdit: handleEditSale,
    onView: setSelectedSale,
    isLoading: isLoading,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ventes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les ventes de votre système
          </p>
        </div>

        {hasPermission && (
          <Button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Vente</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<Receipt className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Brouillons" 
          value={stats.draft} 
          icon={<Clock className="h-4 w-4 text-yellow-600" />}
          colorClass="yellow-600"
        />
        <StatsCard 
          title="Confirmées" 
          value={stats.confirmed} 
          icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
          colorClass="blue-600"
        />
        <StatsCard 
          title="Annulées" 
          value={stats.cancelled} 
          icon={<TrendingUp className="h-4 w-4 text-red-600" />}
          colorClass="red-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Liste des Ventes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SaleSearch 
              data={salesData}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredSales(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Filtrer les ventes"
            />
          </div>
          
          <BulkActions 
            selectedSales={selectedSales}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkCancel={handleBulkCancel}
          />
          
          <div className="overflow-x-auto">
            {displayData.length === 0 ? (
              <EmptyState 
                title="Aucun résultat"
                description="Aucune vente ne correspond aux filtres actuels"
              />
            ) : (
              <SaleProvider onEditSale={handleEditSale}>
                <DataTable 
                  columns={columns} 
                  data={displayData}
                  onRowSelectionChange={handleRowSelectionChange}
                  enablePagination={false}
                  enableToolbar={true}
                />
              </SaleProvider>
            )}
          </div>
          
          <PaginationComponent 
            sales={sales}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <SaleForm
        key="create-sale-form"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      <SaleForm
        key="edit-sale-form"
        open={!!editingSale}
        onOpenChange={(open) => !open && setEditingSale(null)}
        sale={editingSale}
        mode="edit"
      />
      
      <SaleDetailsDialog
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
        onSaleUpdate={handleSaleUpdate}
      />
    </div>
  )
}