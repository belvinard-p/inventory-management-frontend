"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { saleService } from "@/service/saleService"
import type { Sale, SaleRequest, SaleStatus } from "@/types/sale"
import { toast } from "sonner"
import { SalesCacheKeys } from "@/lib/const"
import { useCreateSale, useUpdateSale, useDeleteSale, useUpdateSaleStatus, useCancelSale } from "@/hooks/useSales"

export function useAdminSaleLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedSales, setSelectedSales] = useState<Sale[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  
  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_SALES'
  
  const { data: sales = [], isLoading, isError } = useQuery({
    queryKey: [SalesCacheKeys.Sales, currentPage, pageSize],
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

  // Mutations
  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale()
  const deleteMutation = useDeleteSale()
  const updateStatusMutation = useUpdateSaleStatus()
  const cancelMutation = useCancelSale()

  // Handlers
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Vente supprimée avec succès")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleUpdateStatus = async (id: number, status: SaleStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status })
      toast.success("Statut mis à jour avec succès")
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut")
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Vente annulée avec succès")
    } catch (error) {
      toast.error("Erreur lors de l'annulation")
    }
  }

  const handleBulkDelete = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)))
      toast.success(`${ids.length} vente(s) supprimée(s) avec succès`)
    } catch (error) {
      toast.error("Erreur lors de la suppression en lot")
    }
  }

  const handleBulkUpdateStatus = async (ids: number[], status: SaleStatus) => {
    try {
      await Promise.all(ids.map(id => updateStatusMutation.mutateAsync({ id, status })))
      toast.success(`${ids.length} vente(s) mise(s) à jour avec succès`)
    } catch (error) {
      toast.error("Erreur lors de la mise à jour en lot")
    }
  }

  const handleBulkCancel = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => cancelMutation.mutateAsync(id)))
      toast.success(`${ids.length} vente(s) annulée(s) avec succès`)
    } catch (error) {
      toast.error("Erreur lors de l'annulation en lot")
    }
  }

  const handleFormSubmit = async (data: SaleRequest) => {
    try {
      if (editingSale) {
        await updateMutation.mutateAsync({ id: editingSale.id, data })
        toast.success("Vente modifiée avec succès")
        setEditingSale(null)
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Vente créée avec succès")
      }
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleSaleUpdate = () => {
    // Trigger refetch or update logic
  }

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
    selectedSale,
    setIsCreateModalOpen,
    setFilteredSales,
    setHasFilter,
    handleEditSale,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingSale,
    setSelectedSale,
    handleDelete,
    handleUpdateStatus,
    handleCancel,
    handleBulkDelete,
    handleBulkUpdateStatus,
    handleBulkCancel,
    handleFormSubmit,
    handleSaleUpdate,
    isFormLoading: createMutation.isPending || updateMutation.isPending
  }
}