"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Package, Plus, ShieldAlert } from "lucide-react"
import { EmptyState } from "@/components/global"

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="flex items-center justify-center min-h-[400px] p-4">
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
  readonly onCreateClick: () => void
  readonly hasPermission: boolean
}

export function EmptyLinesState({ onCreateClick, hasPermission }: EmptyLinesStateProps) {
  return (
    <Card>
      <CardContent className="p-12">
        <EmptyState
          title="Aucun article dans cette commande"
          description="Commencez par ajouter des articles à cette commande."
          icon={<Package className="h-12 w-12 text-muted-foreground" />}
        />
        {hasPermission && (
          <div className="flex justify-center mt-6">
            <Button onClick={onCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingLinesState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lignes de commande</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
      <LoadingSpinner />
    </div>
  )
}

export function ErrorLinesState() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lignes de commande</h1>
          <p className="text-muted-foreground">Erreur lors du chargement</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Une erreur est survenue lors du chargement des lignes de commande.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
