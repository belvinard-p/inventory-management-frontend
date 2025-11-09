"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CmdClientProvider } from "./CmdClientContext"
import { CmdClientSearch } from "./CmdClientSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../../company/DataTable"
import { createColumns } from "./Columns"
import { EmptyState } from "@/components/global"
import { CmdClientForm } from "./CmdClientForm"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ClientOrderResponse, ClientOrderRequest, OrderStatus } from "@/types/client/clientOrder"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminCmdClientContentProps {
  readonly currentUser: { roleName: string } | null
  readonly ordersData: ClientOrderResponse[]
  readonly displayData: ClientOrderResponse[]
  readonly stats: {
    readonly total: number
    readonly pending: number
    readonly confirmed: number
    readonly completed: number
  }
  readonly orders: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly selectedOrders: ClientOrderResponse[]
  readonly isCreateModalOpen: boolean
  readonly editingOrder: ClientOrderResponse | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly setFilteredOrders: (orders: ClientOrderResponse[]) => void
  readonly setHasFilter: (hasFilter: boolean) => void
  readonly handleEditOrder: (order: ClientOrderResponse) => void
  readonly handleRowSelectionChange: (selection: unknown) => void
  readonly clearSelection: () => void
  readonly setCurrentPage: (page: number) => void
  readonly setEditingOrder: (order: ClientOrderResponse | null) => void
  readonly handleDelete: (id: number) => Promise<void>
  readonly handleUpdateStatus: (id: number, status: OrderStatus) => Promise<void>
  readonly handleCancel: (id: number) => Promise<void>
  readonly handleBulkDelete: (ids: number[]) => Promise<void>
  readonly handleBulkUpdateStatus: (ids: number[], status: OrderStatus) => Promise<void>
  readonly handleBulkCancel: (ids: number[]) => Promise<void>
  readonly handleFormSubmit: (data: ClientOrderRequest) => Promise<void>
  readonly isLoading: boolean
  readonly isFormLoading: boolean
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

function PaginationComponent({ orders, currentPage, setCurrentPage }: {
  readonly orders: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!orders || orders.totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
        <span className="hidden sm:inline">Page {currentPage + 1} sur {orders.totalPages} ({orders.totalElements} commandes)</span>
        <span className="sm:hidden">{currentPage + 1}/{orders.totalPages}</span>
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
          
          {Array.from({ length: Math.min(orders.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (orders.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > orders.totalPages - 4) {
                pageIndex = orders.totalPages - 5 + i
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
              onClick={() => setCurrentPage(Math.min(orders.totalPages - 1, currentPage + 1))}
              className={currentPage === orders.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminCmdClientContent({
  currentUser,
  ordersData,
  displayData,
  stats,
  orders,
  currentPage,
  selectedOrders,
  isCreateModalOpen,
  editingOrder,
  setIsCreateModalOpen,
  setFilteredOrders,
  setHasFilter,
  handleEditOrder,
  handleRowSelectionChange,
  clearSelection,
  setCurrentPage,
  setEditingOrder,
  handleDelete,
  handleUpdateStatus,
  handleCancel,
  handleBulkDelete,
  handleBulkUpdateStatus,
  handleBulkCancel,
  handleFormSubmit,
  isLoading,
  isFormLoading
}: AdminCmdClientContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  // Create columns with handlers
  const columns = createColumns({
    onDelete: handleDelete,
    onUpdateStatus: handleUpdateStatus,
    onCancel: handleCancel,
    isLoading: isLoading,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Commandes Clients</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les commandes de vos clients
          </p>
        </div>

        {hasPermission && (
          <Button 
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Commande</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<Package className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="En Attente" 
          value={stats.pending} 
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
          title="Complétées" 
          value={stats.completed} 
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Liste des Commandes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CmdClientSearch 
              data={ordersData}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredOrders(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Filtrer les commandes"
            />
          </div>
          
          <BulkActions 
            selectedOrders={selectedOrders}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            onBulkCancel={handleBulkCancel}
          />
          
          <div className="overflow-x-auto">
            {displayData.length === 0 ? (
              <EmptyState 
                title="Aucun résultat"
                description="Aucune commande ne correspond aux filtres actuels"
              />
            ) : (
              <CmdClientProvider onEditOrder={handleEditOrder}>
                <DataTable 
                  columns={columns} 
                  data={displayData}
                  onRowSelectionChange={handleRowSelectionChange}
                  enablePagination={false}
                  enableToolbar={true}
                />
              </CmdClientProvider>
            )}
          </div>
          
          <PaginationComponent 
            orders={orders}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CmdClientForm
        key="create-order-form"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
      
      <CmdClientForm
        key="edit-order-form"
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        order={editingOrder}
        mode="edit"
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />
    </div>
  )
}
