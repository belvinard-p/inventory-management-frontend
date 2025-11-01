"use client"

import { useState, useEffect } from "react"
import { useArticles } from "@/hooks/article/useArticle"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { ArticleResponse } from "@/types/article"
import { toast } from "sonner"

export function useAdminArticleLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<ArticleResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredArticles, setFilteredArticles] = useState<ArticleResponse[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedArticles, setSelectedArticles] = useState<ArticleResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const { articles, isLoading, isError } = useArticles(currentPage, pageSize)
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'
  const articlesData = Array.isArray(articles?.content) ? articles.content : []
  const displayData = hasFilter ? filteredArticles : articlesData

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingArticle) setEditingArticle(null)
    }
  })

  useEffect(() => setMounted(true), [])
  
  useEffect(() => {
    if (articlesData.length > 0 && filteredArticles.length === 0 && !hasFilter) {
      setFilteredArticles(articlesData)
    }
  }, [articlesData, filteredArticles.length, hasFilter])

  const handleEditArticle = (article: ArticleResponse) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingArticle(article)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedArticles(selected)
  }

  const clearSelection = () => setSelectedArticles([])

  const stats = {
    total: articles?.totalElements ?? articlesData.length,
    active: articlesData.filter(a => a.status === 'ACTIVE')?.length || 0,
    archived: articlesData.filter(a => a.status === 'ARCHIVED')?.length || 0,
    withImage: articlesData.filter(a => a.image)?.length || 0,
    lowStock: articlesData.filter(a => a.quantityInStock < 10)?.length || 0,
    outOfStock: articlesData.filter(a => a.availableQuantity === 0)?.length || 0,
  }

  return {
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
  }
}

