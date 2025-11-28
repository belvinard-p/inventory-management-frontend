"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { orderSupplierLineService } from "@/service/supplier/orderSupplierLineService"
import { articleService } from "@/service/articleService"
import type { SupplierOrderLine, SupplierOrderLineRequest } from "@/types/supplier/supplierOrderLine"
import { toast } from "sonner"
import { useOrderSupplierLines } from "./useOrderSupplierLine"

interface UseAdminCmdSupplierLineLogicProps {
  supplierOrderId: number
}

export function useAdminCmdSupplierLineLogic({ supplierOrderId }: UseAdminCmdSupplierLineLogicProps) {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLine, setEditingLine] = useState<SupplierOrderLine | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredLines, setFilteredLines] = useState<SupplierOrderLine[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedLines, setSelectedLines] = useState<SupplierOrderLine[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

  const queryClient = useQueryClient()

  const { data: lines = [], isLoading, isError } = useQuery({
    queryKey: ["orderSupplierLines", supplierOrderId],
    queryFn: async () => {
      const lines = await orderSupplierLineService.getAllLinesForOrder(supplierOrderId)
      const order = await import("@/service/supplier/supplierOrderService").then(m => m.supplierOrderService.getById(supplierOrderId))
      
      const linesWithDetails = await Promise.all(
        lines.map(async (line: SupplierOrderLine) => {
          try {
            const article = await articleService.getById(line.articleId)
            return {
              ...line,
              articleDesignation: article.designation,
              articleCode: article.codeArticle,
              supplierName: order?.supplierName || "Fournisseur non trouvé",
            }
          } catch (error) {
            return {
              ...line,
              supplierName: order?.supplierName || "Fournisseur non trouvé",
            }
          }
        })
      )

      return linesWithDetails
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken && !!supplierOrderId
  })

  const { data: total = 0 } = useQuery({
    queryKey: ["orderSupplierLines", supplierOrderId, "total"],
    queryFn: () => orderSupplierLineService.calculateTotal(supplierOrderId),
    enabled: hasPermission && !!accessToken && !!supplierOrderId
  })

  const linesData = Array.isArray(lines) ? lines : []
  const displayData = hasFilter ? filteredLines : linesData

  const {
    createOrderSupplierLine,
    createOrderSupplierLineAsync,
    updateOrderSupplierLine,
    deleteOrderSupplierLine,
    isCreating,
    isUpdating,
    isDeleting,
  } = useOrderSupplierLines()

  const stats = useMemo(() => {
    const uniqueArticles = new Set(linesData.map(line => line.articleId)).size
    return {
      total: linesData.length,
      totalAmount: total,
      uniqueArticles,
      averageQuantity: linesData.length > 0
        ? Math.round(linesData.reduce((sum, line) => sum + line.quantity, 0) / linesData.length)
        : 0,
    }
  }, [linesData, total])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditLine = (line: SupplierOrderLine) => {
    setEditingLine(line)
  }

  const handleRowSelectionChange = (selection: unknown) => {
    const rowSelection = selection as Record<string, boolean>
    const selected = displayData.filter((_, index) => rowSelection[index])
    setSelectedLines(selected)
  }

  const clearSelection = () => {
    setSelectedLines([])
  }

  const handleDelete = async (id: number) => {
    await deleteOrderSupplierLine(id)
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId] })
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId, "total"] })
    queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
  }

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    await updateOrderSupplierLine({ id, quantity })
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId] })
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId, "total"] })
    queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
  }

  const handleBulkDelete = async (ids: number[]) => {
    await Promise.all(ids.map(id => deleteOrderSupplierLine(id)))
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId] })
    queryClient.invalidateQueries({ queryKey: ["orderSupplierLines", supplierOrderId, "total"] })
    queryClient.invalidateQueries({ queryKey: ["supplierOrders"] })
    toast.success(`${ids.length} ligne(s) supprimée(s)`)
    clearSelection()
  }

  const handleFormSubmit = async (data: SupplierOrderLineRequest) => {
    if (editingLine) {
      await handleUpdateQuantity(editingLine.id, data.quantity)
      setEditingLine(null)
    } else {
      await createOrderSupplierLineAsync(data)
      setIsCreateModalOpen(false)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    authLoading,
    mounted,
    hasPermission,
    linesData,
    displayData,
    stats,
    total,
    isLoading,
    isError,
    currentPage,
    selectedLines,
    isCreateModalOpen,
    editingLine,
    setIsCreateModalOpen,
    setFilteredLines,
    setHasFilter,
    handleEditLine,
    handleRowSelectionChange,
    clearSelection,
    setCurrentPage,
    setEditingLine,
    handleDelete,
    handleUpdateQuantity,
    handleBulkDelete,
    handleFormSubmit,
    isFormLoading: isCreating || isUpdating,
    supplierOrderId,
  }
}