"use client"

import React from "react"
import { useCompanies } from "@/hooks/useCompany"
import { useAuth } from "@/hooks/useAuth"
import { DataTable } from "./DataTable"
import { columns } from "./Columns"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin, Globe, Phone } from "lucide-react"
import { CompanyForm } from "./CompanyForm"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyProvider } from "./CompanyContext"
import { CompanyTableSkeleton } from "./CompanyTableSkeleton"

import { CompanySearch } from "./CompanySearch"
import { BulkActions } from "./BulkActions"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { Company } from "@/types"
import { toast } from "sonner"
import { EmptyState } from "@/components/global/EmptyState"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function AdminCompany() {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [mounted, setMounted] = useState(false)

  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])

  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const { companies, isLoading, isError } = useCompanies(currentPage, pageSize)

  // Check user permissions
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' ||
                         currentUser?.roleName === 'ROLE_MANAGER'

  // Keyboard shortcuts - Called unconditionally before any conditional returns
  // This fix prevents the "Rendered more hooks" error.
  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingCompany) setEditingCompany(null)
    }
  })
  // -------------------------------------------------------------------------

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute data early to use in useEffect
  const companiesData = Array.isArray(companies?.content) ? companies.content : []
  
  useEffect(() => {
    if (companiesData.length > 0 && filteredCompanies.length === 0 && !hasFilter) {
      setFilteredCompanies(companiesData)
    }
  }, [companiesData, filteredCompanies.length, hasFilter])



  // Fonction pour gérer l'édition avec vérification du token
  const handleEditCompany = (company: Company) => {
    if (!accessToken) {
      toast.error("Session expirée", {
        description: "Veuillez vous reconnecter"
      })
      return
    }
    setEditingCompany(company)
  }

  // --- CONDITIONAL RENDERING STARTS HERE ---

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Non authentifié</h2>
            <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayData = hasFilter ? filteredCompanies : companiesData

  const stats = {
    total: (companies && typeof companies.totalElements === 'number') ? companies.totalElements : (companiesData.length || 0),
    withWebsite: companiesData.filter(c => c.website)?.length || 0,
    withCategories: companiesData.filter(c => c.categories && c.categories.length > 0)?.length || 0,
    withSuppliers: companiesData.filter(c => c.suppliers && c.suppliers.length > 0)?.length || 0,
  }

  // Gérer la sélection multiple
  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedCompanies(selected)
  }

  const clearSelection = () => {
    setSelectedCompanies([])
  }

  // Si pas d'erreur mais aucune donnée, afficher l'état vide
  if (!isLoading && !isError && companiesData.length === 0) {
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
          {(currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER') && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Entreprise
            </Button>
          )}
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune entreprise trouvée</h2>
            <p className="text-muted-foreground mb-4">Commencez par créer votre première entreprise.</p>
            {(currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER') && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une entreprise
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Create Company Modal */}
        <CompanyForm
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          mode="create"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
            <p className="text-muted-foreground">
              Chargement des données...
            </p>
          </div>
        </div>
        
        {/* Enhanced Loading State */}
        <div className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Chargement des entreprises...</p>
                <p className="text-xs text-muted-foreground">Cela peut prendre jusqu&apos;à 45 secondes</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Actualiser la page
                </Button>
              </div>
              {/* Progress bar simulation */}
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
          <CompanyTableSkeleton />
        </div>
      </div>
    )
  }

  // Vérifier si c'est une vraie erreur ou juste aucune donnée
  if (isError) {
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
          {(currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER') && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Entreprise
            </Button>
          )}
        </div>

        {/* Error State - Reusing Empty State UI for simplicity */}
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">Impossible de charger les données des entreprises. Veuillez réessayer.</p>

          </CardContent>
        </Card>

        {/* Create Company Modal */}
        <CompanyForm 
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          mode="create"
        />
      </div>
    )
  }

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
        {(currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER') && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Entreprise
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors duration-300">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:scale-105 transition-transform duration-300">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-blue-600 transition-colors duration-300">Avec site web</CardTitle>
            <Globe className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 group-hover:scale-105 transition-transform duration-300">{stats.withWebsite}</div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-green-600 transition-colors duration-300">Avec catégories</CardTitle>
            <MapPin className="h-4 w-4 text-green-600 group-hover:scale-110 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform duration-300">{stats.withCategories}</div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-purple-600 transition-colors duration-300">Avec fournisseurs</CardTitle>
            <Phone className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-all duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 group-hover:scale-105 transition-transform duration-300">{stats.withSuppliers}</div>
          </CardContent>
        </Card>
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
          
          {/* Pagination personnalisée */}
          {companies && companies.totalPages > 1 && (
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
          )}
        </CardContent>
      </Card>

      {/* Create Company Modal */}
      <CompanyForm 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      {/* Edit Company Modal */}
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