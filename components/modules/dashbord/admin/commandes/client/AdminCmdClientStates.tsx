"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Package, Plus, ShieldAlert } from "lucide-react"

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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Aucune commande</CardTitle>
          <CardDescription>
            Commencez par créer votre première commande client
          </CardDescription>
        </CardHeader>
        {hasPermission && (
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <Plus className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </CardContent>
        )}
      </Card>
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
