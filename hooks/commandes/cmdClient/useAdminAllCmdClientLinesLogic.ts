"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { orderClientLineService } from "@/service/client/orderClientLineService"
import { articleService } from "@/service/articleService"
import type { OrderClientLineResponse, OrderClientLineRequest } from "@/types/client/orderClientLine"
import { toast } from "sonner"
import { useOrderClientLines } from "./useOrderClientLine"

export function useAdminAllCmdClientLinesLogic() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLine, setEditingLine] = useState<OrderClientLineResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filteredLines, setFilteredLines] = useState<OrderClientLineResponse[]>([])
  const [hasFilter, setHasFilter] = useState(false)
  const [selectedLines, setSelectedLines] = useState<OrderClientLineResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  const pageSize = 10
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

  const queryClient = useQueryClient()

  const { data: lines = [], isLoading, isError } = useQuery({
    queryKey: ["allOrderClientLines"],
    queryFn: async () => {
      const lines = await orderClientLineService.getAllLines()

      const linesWithArticles = await Promise.all(
        lines.map(async (line: OrderClientLineResponse) => {
          const article = await articleService.getById(line.articleId)
          return {
            ...line,
            articleDesignation: article.designation,
            articleCode: article.codeArticle,
          }
        })
      )

      return linesWithArticles
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission && !!accessToken
  })

  const { data: total = 0 } = useQuery({
    queryKey: ["allOrderClientLines", "total"],
    queryFn: async () => {
      const lines = await orderClientLineService.getAllLines()
      return lines.reduce((sum, line) => sum + (line.totalLinePrice || 0), 0)
    },
    enabled: hasPermission && !!accessToken
  })

  const linesData = Array.isArray(lines) ? lines : []
  const displayData = hasFilter ? filteredLines : linesData

  const {
    createOrderClientLine,
    createOrderClientLineAsync,
    updateOrderClientLine,
    deleteOrderClientLine,
    isCreating,
    isUpdating,
    isDeleting,
  } = useOrderClientLines()

  const stats = useMemo(() => {
    return {
      total: linesData.length,
      totalAmount: total,
      averageQuantity: linesData.length > 0
        ? Math.round(linesData.reduce((sum, line) => sum + line.quantity, 0) / linesData.length)
        : 0,
    }
  }, [linesData, total])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditLine = (line: OrderClientLineResponse) => {
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
    await deleteOrderClientLine(id)
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines"] })
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines", "total"] })
    queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
    toast.success("Ligne supprimée avec succès")
  }

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    await updateOrderClientLine({ id, quantity })
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines"] })
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines", "total"] })
    queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
    toast.success("Quantité mise à jour")
  }

  const handleBulkDelete = async (ids: number[]) => {
    await Promise.all(ids.map(id => deleteOrderClientLine(id)))
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines"] })
    queryClient.invalidateQueries({ queryKey: ["allOrderClientLines", "total"] })
    queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
    toast.success(`${ids.length} ligne(s) supprimée(s)`)
    clearSelection()
  }

  const handleFormSubmit = async (data: OrderClientLineRequest) => {
    if (editingLine) {
      await handleUpdateQuantity(editingLine.id, data.quantity)
      setEditingLine(null)
    } else {
      await createOrderClientLineAsync(data)
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
  }
}
