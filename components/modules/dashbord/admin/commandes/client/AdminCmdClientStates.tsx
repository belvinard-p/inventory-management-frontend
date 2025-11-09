"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Package, Plus, ShieldAlert } from "lucide-react"
import { EmptyState } from "@/components/global"
import { CmdClientForm } from "./CmdClientForm"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

interface AuthErrorStateProps {
  readonly title: string
  readonly description: string
}

export function AuthErrorState({ title, description }: AuthErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => window.location.href = '/login'}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface EmptyOrdersStateProps {
  readonly currentUser: { roleName: string } | null
  readonly isCreateModalOpen: boolean
  readonly setIsCreateModalOpen: (open: boolean) => void
}

export function EmptyOrdersState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: EmptyOrdersStateProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes Clients</h1>
          <p className="text-muted-foreground">
            Gérez les commandes de vos clients
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Commande
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-12">
          <EmptyState
            title="Aucune commande trouvée"
            description="Commencez par créer votre première commande client."
            icon={<Package className="h-12 w-12 text-muted-foreground" />}
          />
          {hasPermission && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une commande
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Form Modal */}
      <CmdClientForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
    </div>
  )
}

export function LoadingOrdersState() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Chargement des commandes</CardTitle>
          <CardDescription>Veuillez patienter...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

interface ErrorOrdersStateProps {
  readonly currentUser: { roleName: string } | null
  readonly isCreateModalOpen: boolean
  readonly setIsCreateModalOpen: (open: boolean) => void
}

export function ErrorOrdersState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: ErrorOrdersStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Erreur de chargement</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du chargement des commandes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
