"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, User, ShoppingCart, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientProvider } from "./ClientContext"
import { ClientSearch } from "./ClientSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../company/DataTable"
import { columns } from "./Columns"
import { EmptyState } from "@/components/global"
import { ClientForm } from "./ClientForm"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ClientResponse } from "@/types/client/client"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminClientContentProps {
  readonly currentUser: { roleName: string } | null
  readonly clientsData: ClientResponse[]
  readonly displayData: ClientResponse[]
  readonly stats: {
    readonly total: number
    readonly withOrders: number
    readonly withoutOrders: number
    readonly withAddress: number
    readonly withoutAddress: number
  }
  readonly clients: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly selectedClients: ClientResponse[]
  readonly isCreateModalOpen: boolean
  readonly editingClient: ClientResponse | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly setFilteredClients: (clients: ClientResponse[]) => void
  readonly setHasFilter: (hasFilter: boolean) => void
  readonly handleEditClient: (client: ClientResponse) => void
  readonly handleRowSelectionChange: (selection: unknown) => void
  readonly clearSelection: () => void
  readonly setCurrentPage: (page: number) => void
  readonly setEditingClient: (client: ClientResponse | null) => void
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-${colorClass}/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-${colorClass}/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium group-hover:text-${colorClass} transition-colors duration-300`}>{title}</CardTitle>
        <div className={`group-hover:scale-110 group-hover:text-${colorClass} transition-all duration-300`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${colorClass} group-hover:scale-105 transition-transform duration-300`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function PaginationComponent({ clients, currentPage, setCurrentPage }: {
  readonly clients: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!clients || clients.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} sur {clients.totalPages} ({clients.totalElements} clients)
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
          
          {Array.from({ length: Math.min(clients.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (clients.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > clients.totalPages - 4) {
                pageIndex = clients.totalPages - 5 + i
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
              onClick={() => setCurrentPage(Math.min(clients.totalPages - 1, currentPage + 1))}
              className={currentPage === clients.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminClientContent({
  currentUser,
  clientsData,
  displayData,
  stats,
  clients,
  currentPage,
  selectedClients,
  isCreateModalOpen,
  editingClient,
  setIsCreateModalOpen,
  setFilteredClients,
  setHasFilter,
  handleEditClient,
  handleRowSelectionChange,
  clearSelection,
  setCurrentPage,
  setEditingClient
}: AdminClientContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez les clients de votre système
          </p>
        </div>

        {hasPermission && (
          <Button 
            type="button"
onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<User className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Avec commandes" 
          value={stats.withOrders} 
          icon={<ShoppingCart className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
        <StatsCard 
          title="Sans commandes" 
          value={stats.withoutOrders} 
          icon={<ShoppingCart className="h-4 w-4 text-gray-600" />}
          colorClass="gray-600"
        />
        <StatsCard 
          title="Avec adresse" 
          value={stats.withAddress} 
          icon={<MapPin className="h-4 w-4 text-blue-600" />}
          colorClass="blue-600"
        />
        <StatsCard 
          title="Sans adresse" 
          value={stats.withoutAddress} 
          icon={<MapPin className="h-4 w-4 text-orange-600" />}
          colorClass="orange-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <ClientSearch 
              data={clientsData}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredClients(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Rechercher client"
            />
          </div>
          
          <BulkActions 
            selectedClients={selectedClients}
            onClearSelection={clearSelection}
          />
          
          {displayData.length === 0 ? (
            <EmptyState 
              title="Aucun résultat"
              description="Aucun client ne correspond aux filtres actuels"
            />
          ) : (
            <ClientProvider onEditClient={handleEditClient}>
              <DataTable 
                columns={columns} 
                data={displayData}
                onRowSelectionChange={handleRowSelectionChange}
                enablePagination={false}
                enableToolbar={true}
              />
            </ClientProvider>
          )}
          
          <PaginationComponent 
            clients={clients}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>


      
      {/* Modals */}
      <ClientForm
        key="create-client-form"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      <ClientForm
        key="edit-client-form"
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        client={editingClient}
        mode="edit"
      />
    </div>
  )
}

