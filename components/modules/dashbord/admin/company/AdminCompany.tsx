"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useCompanies } from "@/hooks/useCompany"
import { useAuth } from "@/hooks/useAuth"
import { InfiniteCompanyList } from "./InfiniteCompanyList"
import { DataTable } from "./DataTable"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin, Globe, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyProvider } from "./CompanyContext"
import { CompanyTableSkeleton } from "./CompanyTableSkeleton"
import { CompanySearch } from "./CompanySearch"
import { BulkActions } from "./BulkActions"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { List, Grid } from "lucide-react"
import type { Company } from "@/types"
import { toast } from "sonner"
import { CompanyForm } from "./CompanyForm"
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
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'infinite'>('table')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  
  // Single source of truth for companies data
  const { 
    companies, 
    isLoading: companiesLoading, 
    isError 
  } = useCompanies(currentPage, pageSize)
  
  // Memoize the current page data
  const currentPageData = useMemo(() => {
    return companies?.content || []
  }, [companies])

  // Define columns for the data table
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phoneNumber",
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }: { row: { original: Company } }) => {
        const address = row.original.address;
        return address ? `${address.address1 || ''} ${address.city || ''} ${address.country || ''}`.trim() : '';
      }
    },
    // Add more columns as needed
  ];

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

  // Handle search filtering
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredData = useMemo(() => {
    if (!companies?.content) return [];
    
    if (!searchQuery) return companies.content;
    
    const query = searchQuery.toLowerCase();
    return companies.content.filter(company => 
      company.name?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.phoneNumber?.toLowerCase().includes(query) ||
      company.vatNumber?.toLowerCase().includes(query) ||
      company.siret?.toLowerCase().includes(query) ||
      company.siren?.toLowerCase().includes(query) ||
      company.website?.toLowerCase().includes(query) ||
      company.description?.toLowerCase().includes(query) ||
      (company.address && (
        (company.address.address1?.toLowerCase().includes(query)) ||
        (company.address.city?.toLowerCase().includes(query)) ||
        (company.address.country?.toLowerCase().includes(query)) ||
        (company.address.postalCode?.toLowerCase().includes(query))
      ))
    );
  }, [companies?.content, searchQuery]);
  
  // Clear selection
  const clearSelection = () => {
    setSelectedCompanies([]);
  };
  
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

  // Get data to display based on view mode and search
  const displayData = useMemo(() => {
    if (viewMode === 'infinite') return []
    return filteredData.length > 0 || currentPageData.length === 0 ? filteredData : currentPageData
  }, [viewMode, filteredData, currentPageData])

  // Add missing mounted state
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

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
            <h2 className="text-xl font-semibent mb-2">Non authentifié</h2>
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

  const stats = {
    total: currentPageData.length || 0,
    withWebsite: currentPageData.filter(c => c.website)?.length || 0,
    withCategories: currentPageData.filter(c => c.categories && c.categories.length > 0)?.length || 0,
    withSuppliers: currentPageData.filter(c => c.suppliers && c.suppliers.length > 0)?.length || 0,
  }

  // Gérer la sélection multiple
  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedCompanies(selected)
  }


  // Si pas d'erreur mais aucune donnée, afficher l'état vide
  if (!companiesLoading && !isError && currentPageData.length === 0) {
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

  if (companiesLoading) {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          {/* Mode de vue */}
          <div className="flex items-center justify-between">
            <CompanySearch 
              data={currentPageData}
              onFilteredData={(filtered) => setSearchQuery(filtered.length === currentPageData.length ? '' : 'filtered')}
              placeholder="Rechercher par nom, email, téléphone..."
            />
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'table' | 'infinite')}>
              <ToggleGroupItem value="table" aria-label="Vue tableau">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="infinite" aria-label="Vue infinie">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <BulkActions 
            selectedCompanies={selectedCompanies}
            onClearSelection={clearSelection}
          />
          
          {viewMode === 'table' ? (
            <>
              <CompanyProvider onEditCompany={handleEditCompany}>
                <DataTable 
                  columns={columns} 
                  data={displayData}
                  onRowSelectionChange={handleRowSelectionChange}
                  enablePagination={false}
                />
              </CompanyProvider>
              
              {/* Pagination personnalisée */}
              {companies && companies.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        size="default"
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: companies.totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          size="default"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(companies.totalPages - 1, currentPage + 1))}
                        disabled={currentPage === companies.totalPages - 1}
                        size="default"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <InfiniteCompanyList onEditCompany={handleEditCompany} />
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