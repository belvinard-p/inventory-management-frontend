"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyArticlesState,
  LoadingArticlesState,
  ErrorArticlesState
} from "./AdminArticleStates"
import { useAdminArticleLogic } from "@/hooks/article/useAdminArticleLogic"

export function AdminArticle() {
  const {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    articlesData,
    displayData,
    stats,
    articles,
    isLoading,
    isError,
    currentPage,
    selectedArticles,
    isCreateModalOpen,
    editingArticle,
    setIsCreateModalOpen,
    setFilteredArticles,
    setHasFilter,
    handleEditArticle,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingArticle
  } = useAdminArticleLogic()

  if (!mounted || authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
  if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
  if (!isLoading && !isError && articlesData.length === 0) return <EmptyArticlesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
  if (isLoading) return <LoadingArticlesState />
  if (isError) return <ErrorArticlesState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            Gérez les articles de votre inventaire
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Actifs</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.archived}</div>
          <div className="text-sm text-muted-foreground">Archivés</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.withImage}</div>
          <div className="text-sm text-muted-foreground">Avec image</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.lowStock}</div>
          <div className="text-sm text-muted-foreground">Stock faible</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{stats.outOfStock}</div>
          <div className="text-sm text-muted-foreground">Rupture</div>
        </div>
      </div>

      {/* Articles List - Basic implementation */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <p className="text-muted-foreground">
            {displayData.length} article(s) affiché(s) sur {stats.total} au total
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            La table des articles sera implémentée ici
          </p>
        </div>
      </div>
    </div>
  )
}