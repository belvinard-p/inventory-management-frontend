"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin, Globe, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyProvider } from "./CompanyContext"
import { CompanySearch } from "./CompanySearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "./DataTable"
import { columns } from "./Columns"
import { CompanyForm } from "./CompanyForm"
import { EmptyState } from "@/components/global/EmptyState"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Company } from "@/types"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminCompanyContentProps {
  readonly currentUser: any
  readonly companiesData: Company[]
  readonly displayData: Company[]
  readonly stats: {
    readonly total: number
    readonly withWebsite: number
    readonly withCategories: number
    readonly withSuppliers: number
  }
  readonly companies: any
  readonly currentPage: number
  readonly selectedCompanies: Company[]
  readonly isCreateModalOpen: boolean
  readonly editingCompany: Company | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly setFilteredCompanies: (companies: Company[]) => void
  readonly setHasFilter: (hasFilter: boolean) => void
  readonly handleEditCompany: (company: Company) => void
  readonly handleRowSelectionChange: (selection: unknown) => void
  readonly clearSelection: () => void
  readonly setCurrentPage: (page: number) => void
  readonly setEditingCompany: (company: Company | null) => void
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

function PaginationComponent({ companies, currentPage, setCurrentPage }: {
  readonly companies: any
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!companies || companies.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} sur {companies.totalPages} ({companies.totalElements} entreprises)
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
          
          {Array.from({ length: Math.min(companies.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (companies.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > companies.totalPages - 4) {
                pageIndex = companies.totalPages - 5 + i
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
              onClick={() => setCurrentPage(Math.min(companies.totalPages - 1, currentPage + 1))}
              className={currentPage === companies.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminCompanyContent({
  currentUser,
  companiesData,
  displayData,
  stats,
  companies,
  currentPage,
  selectedCompanies,
  isCreateModalOpen,
  editingCompany,
  setIsCreateModalOpen,
  setFilteredCompanies,
  setHasFilter,
  handleEditCompany,
  handleRowSelectionChange,
  clearSelection,
  setCurrentPage,
  setEditingCompany
}: AdminCompanyContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
          <p className="text-muted-foreground">
            Gérez les entreprises partenaires et leurs informations
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Entreprise
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Avec site web" 
          value={stats.withWebsite} 
          icon={<Globe className="h-4 w-4 text-blue-600" />}
          colorClass="blue-600"
        />
        <StatsCard 
          title="Avec catégories" 
          value={stats.withCategories} 
          icon={<MapPin className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
        <StatsCard 
          title="Avec fournisseurs" 
          value={stats.withSuppliers} 
          icon={<Phone className="h-4 w-4 text-purple-600" />}
          colorClass="purple-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Entreprises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <CompanySearch 
              data={companiesData}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredCompanies(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Rechercher entreprise"
            />
          </div>
          
          <BulkActions 
            selectedCompanies={selectedCompanies}
            onClearSelection={clearSelection}
          />
          
          {displayData.length === 0 ? (
            <EmptyState 
              title="Aucun résultat"
              description="Aucune entreprise ne correspond aux filtres actuels"
            />
          ) : (
            <CompanyProvider onEditCompany={handleEditCompany}>
              <DataTable 
                columns={columns} 
                data={displayData}
                onRowSelectionChange={handleRowSelectionChange}
                enablePagination={false}
                enableToolbar={true}
              />
            </CompanyProvider>
          )}
          
          <PaginationComponent 
            companies={companies}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CompanyForm 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      {editingCompany && (
        <CompanyForm 
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          mode="edit"
          company={editingCompany}
        />
      )}
    </div>
  )
}