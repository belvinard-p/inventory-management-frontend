"use client"

import { useState, useEffect } from "react"
import { useCompanies } from "@/hooks/useCompany"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { Company } from "@/types"
import { toast } from "sonner"

export function useAdminCompanyLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const { companies, isLoading, isError } = useCompanies(currentPage, pageSize)
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'
  const companiesData = Array.isArray(companies?.content) ? companies.content : []
  const displayData = hasFilter ? filteredCompanies : companiesData

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingCompany) setEditingCompany(null)
    }
  })

  useEffect(() => setMounted(true), [])
  
  useEffect(() => {
    if (companiesData.length > 0 && filteredCompanies.length === 0 && !hasFilter) {
      setFilteredCompanies(companiesData)
    }
  }, [companiesData, filteredCompanies.length, hasFilter])

  const handleEditCompany = (company: Company) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingCompany(company)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedCompanies(selected)
  }

  const clearSelection = () => setSelectedCompanies([])

  const stats = {
    total: companies?.totalElements ?? companiesData.length,
    withWebsite: companiesData.filter(c => c.website)?.length || 0,
    withCategories: companiesData.filter(c => c.categories?.length && c.categories.length > 0)?.length || 0,
    withSuppliers: companiesData.filter(c => c.suppliers?.length && c.suppliers.length > 0)?.length || 0,
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    companiesData,
    displayData,
    stats,
    companies,
    isLoading,
    isError,
    currentPage,
    selectedCompanies,
    isCreateModalOpen,
    editingCompany,
    setIsCreateModalOpen,
    setFilteredCompanies,
    setHasFilter,
    handleEditCompany,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingCompany
  }
}