"use client"

import React from "react"
import {
  LoadingSpinner,
  AuthErrorState,
  EmptyArticlesState,
  LoadingArticlesState,
  ErrorArticlesState
} from "./AdminArticleStates"
import { AdminArticleContent } from "./AdminArticleContent"
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
    <AdminArticleContent
      currentUser={currentUser}
      articlesData={articlesData}
      displayData={displayData}
      stats={stats}
      articles={articles}
      currentPage={currentPage}
      selectedArticles={selectedArticles}
      isCreateModalOpen={isCreateModalOpen}
      editingArticle={editingArticle}
      setIsCreateModalOpen={setIsCreateModalOpen}
      setFilteredArticles={setFilteredArticles}
      setHasFilter={setHasFilter}
      handleEditArticle={handleEditArticle}
      handleRowSelectionChange={handleRowSelectionChange}
      clearSelection={clearSelection}
      setCurrentPage={setCurrentPage}
      setEditingArticle={setEditingArticle}
    />
  )
}