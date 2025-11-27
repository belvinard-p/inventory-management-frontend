"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supplierService } from "@/service/supplier/supplierService"
import { useAuth } from "@/hooks/useAuth"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { Supplier } from "@/types/supplier/supplier"
import { SuppliersCacheKeys } from "@/lib/const"
import { toast } from "sonner"

export function useAdminSupplierLogic() {
    const { user: currentUser, isAuthenticated, isLoading: authLoading, accessToken } = useAuth()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [mounted, setMounted] = useState(false)
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
    const [hasFilter, setHasFilter] = useState(false)
    const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([])

    const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

    const { data: suppliers, isLoading, isError } = useQuery<Supplier[]>({
        queryKey: [SuppliersCacheKeys.Suppliers],
        queryFn: () => supplierService.getAll(),
        staleTime: 5 * 60 * 1000,
        enabled: hasPermission && !!accessToken
    })

    const suppliersData = Array.isArray(suppliers) ? suppliers : []
    const displayData = hasFilter ? filteredSuppliers : suppliersData

    useCommonShortcuts({
        onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
        onEscape: () => {
            if (isCreateModalOpen) setIsCreateModalOpen(false)
            if (editingSupplier) setEditingSupplier(null)
        }
    })

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (suppliersData.length > 0 && filteredSuppliers.length === 0 && !hasFilter) {
            setFilteredSuppliers(suppliersData)
        }
    }, [suppliersData, filteredSuppliers.length, hasFilter])

    const handleEditSupplier = (supplier: Supplier) => {
        if (!accessToken) {
            toast.error("Session expirée", { description: "Veuillez vous reconnecter" })
            return
        }
        setEditingSupplier(supplier)
    }

    const handleRowSelectionChange = (selection: unknown) => {
        const selectionRecord = selection as Record<string, boolean>
        const selectedIds = new Set(Object.keys(selectionRecord).filter(key => selectionRecord[key]))
        const selected = displayData.filter((_, index) => selectedIds.has(index.toString()))
        setSelectedSuppliers(selected)
    }

    const clearSelection = () => setSelectedSuppliers([])

    const stats = {
        total: suppliersData.length,
        withOrders: suppliersData.filter(s => s.supplierOrders && s.supplierOrders.length > 0)?.length || 0,
        withoutOrders: suppliersData.filter(s => !s.supplierOrders || s.supplierOrders.length === 0)?.length || 0,
        withPhone: suppliersData.filter(s => s.phoneNumber)?.length || 0,
        withoutPhone: suppliersData.filter(s => !s.phoneNumber)?.length || 0,
    }

    return {
        currentUser,
        isAuthenticated,
        authLoading,
        mounted,
        hasPermission,
        suppliersData,
        displayData,
        stats,
        suppliers,
        isLoading,
        isError,
        selectedSuppliers,
        isCreateModalOpen,
        editingSupplier,
        setIsCreateModalOpen,
        setFilteredSuppliers,
        setHasFilter,
        handleEditSupplier,
        handleRowSelectionChange,
        clearSelection,
        setEditingSupplier
    }
}
