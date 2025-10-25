import React from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FolderOpen, Loader2, Plus } from "lucide-react"
import { User } from "@/types/user"

interface StateProps {
  currentUser?: User | null
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
}

interface ErrorStateProps extends StateProps {
  onRetry?: () => void
}

export const LoadingSpinner = () => (
  <div className="flex h-[calc(100vh-200px)] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

export const AuthErrorState = ({ title, description }: { title: string; description: string }) => (
  <div className="flex h-[calc(100vh-200px)] items-center justify-center">
    <Alert className="w-full max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  </div>
)

export const EmptyState = ({ currentUser, isCreateModalOpen, setIsCreateModalOpen }: StateProps) => (
  <div className="flex h-[calc(100vh-300px)] flex-col items-center justify-center space-y-4 text-center">
    <FolderOpen className="h-16 w-16 text-muted-foreground" />
    <h3 className="text-xl font-semibold">Aucune catégorie trouvée</h3>
    <p className="max-w-md text-sm text-muted-foreground">
      Commencez par créer votre première catégorie pour organiser vos produits.
    </p>
    <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
      <Plus className="mr-2 h-4 w-4" />
      Créer une catégorie
    </Button>
  </div>
)

export const LoadingState = () => (
  <div className="flex h-[200px] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Chargement des catégories...</span>
  </div>
)

export const ErrorState = ({ currentUser, isCreateModalOpen, setIsCreateModalOpen, onRetry }: ErrorStateProps) => (
  <div className="flex h-[300px] flex-col items-center justify-center space-y-4">
    <AlertCircle className="h-12 w-12 text-destructive" />
    <h3 className="text-xl font-semibold">Erreur lors du chargement</h3>
    <p className="max-w-md text-center text-muted-foreground">
      Une erreur est survenue lors du chargement des catégories. Veuillez réessayer.
    </p>
    <Button variant="outline" onClick={() => window.location.reload()}>
      Réessayer
    </Button>
  </div>
)
