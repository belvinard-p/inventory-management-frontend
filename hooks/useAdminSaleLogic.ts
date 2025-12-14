"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { saleService } from "@/service/saleService"
import type { Sale } from "@/types/sale"
import { toast } from "sonner"

const SALES_CACHE_KEY = 'sales'

export function useAdminSaleLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedSales, setSelectedSales] = useState<Sale[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_SALES'
  
  const { data: sales = [], isLoading, isError } = useQuery({
    queryKey: [SALES_CACHE_KEY, currentPage, pageSize],
    queryFn: () => saleService.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken
  })

  const salesData = Array.isArray(sales) ? sales : []
  const displayData = hasFilter ? filteredSales : salesData

  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false)
      if (editingSale) setEditingSale(null)
    }
  })

  useEffect(() => setMounted(true), [])
  
  useEffect(() => {
    if (salesData.length > 0 && filteredSales.length === 0 && !hasFilter) {
      setFilteredSales(salesData)
    }
  }, [salesData, filteredSales.length, hasFilter])

  const handleEditSale = (sale: Sale) => {
    if (!accessToken) {
      toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
      return
    }
    setEditingSale(sale)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const selectionRecord = selection as Record<string, boolean>
    const selectedIds = Object.keys(selectionRecord).filter(key => selectionRecord[key])
    const selected = displayData.filter((_, index) => selectedIds.includes(index.toString()))
    setSelectedSales(selected)
  }

  const clearSelection = () => setSelectedSales([])

  const stats = {
    total: salesData.length,
    draft: salesData.filter(s => s.status === 'DRAFT').length,
    confirmed: salesData.filter(s => s.status === 'CONFIRMED').length,
    cancelled: salesData.filter(s => s.status === 'CANCELLED').length,
    withLines: salesData.filter(s => s.saleLines && s.saleLines.length > 0).length,
    withoutLines: salesData.filter(s => !s.saleLines || s.saleLines.length === 0).length,
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    salesData,
    displayData,
    stats,
    sales: { totalPages: 1, totalElements: salesData.length },
    isLoading,
    isError,
    currentPage,
    selectedSales,
    isCreateModalOpen,
    editingSale,
    setIsCreateModalOpen,
    setFilteredSales,
    setHasFilter,
    handleEditSale,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingSale
  }
}