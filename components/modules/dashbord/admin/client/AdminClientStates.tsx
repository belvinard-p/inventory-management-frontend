"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, User, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState, LoadingContent } from "@/components/global"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <LoadingContent size="lg" text="Chargement..." />
    </div>
  )
}

export function AuthErrorState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-96">
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export function EmptyClientsState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: EmptyStateProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez les clients de votre système
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-12">
          <EmptyState
            title="Aucun client trouvé"
            description="Commencez par créer votre premier client."
            icon={<User className="h-12 w-12 text-muted-foreground" />}
          />
          {hasPermission && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function LoadingClientsState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <LoadingContent size="lg" text="Chargement des clients..." className="py-12" />
      </div>
    </div>
  )
}

export function ErrorClientsState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: ErrorStateProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez les clients de votre système
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Client
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-12">
          <EmptyState
            title="Erreur de chargement"
            description="Impossible de charger les données des clients. Veuillez réessayer."
            icon={<AlertCircle className="h-12 w-12 text-destructive" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}

