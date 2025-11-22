"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Package, Plus, ShieldAlert } from "lucide-react"
import { EmptyState } from "@/components/global"
import { CmdClientLineForm } from "./CmdClientLineForm"

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

interface EmptyLinesStateProps {
  readonly currentUser?: { roleName: string } | null
  readonly isCreateModalOpen: boolean
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly clientOrderId?: number
  readonly hasPermission: boolean
}

export function EmptyLinesState({
  currentUser,
  isCreateModalOpen,
  setIsCreateModalOpen,
  clientOrderId,
  hasPermission
}: EmptyLinesStateProps) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {clientOrderId ? "Articles de la commande" : "Toutes les lignes de commandes"}
          </h1>
          <p className="text-muted-foreground">
            {clientOrderId ? "Gérez les articles de cette commande" : "Gérez toutes les lignes de commandes clients"}
          </p>
        </div>
        {hasPermission && clientOrderId !== undefined && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une ligne de commande client
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-12">
          <EmptyState
            title={clientOrderId ? "Aucun article dans cette commande" : "Aucune ligne de commande trouvée"}
            description={clientOrderId ? "Commencez par ajouter des articles à cette commande." : "Aucune ligne de commande client n'existe actuellement."}
            icon={<Package className="h-12 w-12 text-muted-foreground" />}
          />
          {hasPermission && clientOrderId !== undefined && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une ligne de commande client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Form Modal */}
      <CmdClientLineForm
        key="create-line-form"
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        clientOrderId={clientOrderId}
      />
    </div>
  )
}

export function LoadingLinesState() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Chargement des lignes</CardTitle>
          <CardDescription>Veuillez patienter...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

interface ErrorLinesStateProps {
  readonly currentUser?: { roleName: string } | null
  readonly isCreateModalOpen?: boolean
  readonly setIsCreateModalOpen?: (open: boolean) => void
}

export function ErrorLinesState({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: ErrorLinesStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Erreur de chargement</CardTitle>
          <CardDescription>
            Une erreur est survenue lors du chargement des lignes de commande
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
