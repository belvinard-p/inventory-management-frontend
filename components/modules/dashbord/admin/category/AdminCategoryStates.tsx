"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryForm } from "./CategoryForm"
import { CategoryTableSkeleton } from "./CategoryTableSkeleton"

interface LoadingStateProps {
  readonly title?: string
  readonly description?: string
}

interface EmptyStateProps {
  readonly currentUser: { roleName: string } | null
  readonly isCreateModalOpen: boolean
  readonly setIsCreateModalOpen: (open: boolean) => void
}

interface ErrorStateProps {
  readonly currentUser: { roleName: string } | null
  readonly isCreateModalOpen: boolean
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly onRetry?: () => void
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export function AuthErrorState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-96">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function EmptyState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: EmptyStateProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardContent className="p-12 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune catégorie trouvée</h2>
          <p className="text-muted-foreground mb-4">Commencez par créer votre première catégorie.</p>
          {hasPermission && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une catégorie
            </Button>
          )}
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

export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <CategoryTableSkeleton />
      </div>
    </div>
  )
}

export function ErrorState({ currentUser, isCreateModalOpen, setIsCreateModalOpen, onRetry }: ErrorStateProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardContent className="p-12 text-center">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger les données des catégories. Veuillez réessayer.</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mr-2">
              Réessayer
            </Button>
          )}
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