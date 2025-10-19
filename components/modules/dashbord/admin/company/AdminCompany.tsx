"use client"

import { useCompanies } from "@/hooks/useCompany"
import { useAuth } from "@/hooks/useAuth"
import { DataTable } from "./DataTable"
import { columns } from "./Columns"
import { Button } from "@/components/ui/button"
import { Plus, Building2, MapPin, Globe, Mail, Phone } from "lucide-react"
import { CompanyForm } from "./CompanyForm"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyProvider } from "./CompanyContext"
import type { Company } from "@/types"
import { toast } from "sonner"

export function AdminCompany() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const { companies, isLoading, isError } = useCompanies()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [mounted, setMounted] = useState(false)

  // Debug logging
  console.log('AdminCompany render:', { isLoading, isError, companies, companiesLength: companies?.content?.length })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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

  // Vérifier si l'utilisateur a les permissions (ADMIN ou MANAGER)
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || 
                       currentUser?.roleName === 'ROLE_MANAGER'
  
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
            <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const companiesData = Array.isArray(companies?.content) ? companies.content : []
  const stats = {
    total: companiesData.length || 0,
    withWebsite: companiesData.filter(c => c.website)?.length || 0,
    withCategories: companiesData.filter(c => c.categories && c.categories.length > 0)?.length || 0,
    withSuppliers: companiesData.filter(c => c.suppliers && c.suppliers.length > 0)?.length || 0,
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <CardContent>
          <CompanyProvider onEditCompany={handleEditCompany}>
            <DataTable columns={columns} data={companiesData} />
          </CompanyProvider>
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