"use client"

import { useState, useEffect } from "react"
import { useCategories } from "@/hooks/category/useCategory"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { CategoryResponse } from "@/types/category"
import { toast } from "sonner"

export function useAdminCategoryLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponse[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<CategoryResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const { categories, isLoading, isError } = useCategories(currentPage, pageSize)
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'
  const categoriesData = categories || { content: [], totalElements: 0, totalPages: 0 }
  const displayData = hasFilter ? filteredCategories : categoriesData.content

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingCategory) setEditingCategory(null)
    }
  })

  useEffect(() => setMounted(true), [])
  
  useEffect(() => {
    if (categoriesData.content.length > 0 && filteredCategories.length === 0 && !hasFilter) {
      setFilteredCategories(categoriesData.content)
    }
  }, [categoriesData.content, filteredCategories.length, hasFilter])

  const handleEditCategory = (category: CategoryResponse) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingCategory(category)
  }

  const handleDeleteCategory = (category: CategoryResponse) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    // TODO: Implement delete logic
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedCategories(selected)
  }

  const clearSelection = () => setSelectedCategories([])

  const stats = {
    total: categoriesData.totalElements,
    active: categoriesData.content.filter(c => c.isActive)?.length || 0,
    inactive: categoriesData.content.filter(c => !c.isActive)?.length || 0,
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    categoriesData,
    displayData,
    stats,
    categories,
    isLoading,
    isError,
    currentPage,
    selectedCategories,
    isCreateModalOpen,
    editingCategory,
    setIsCreateModalOpen,
    setFilteredCategories,
    setHasFilter,
    handleEditCategory,
    handleDeleteCategory,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingCategory
  }
}