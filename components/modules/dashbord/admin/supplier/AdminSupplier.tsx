"use client"

import React from "react"
import {
    LoadingSpinner,
    AuthErrorState,
    EmptySuppliersState,
    LoadingSuppliersState,
    ErrorSuppliersState
} from "./AdminSupplierState"
import { AdminSupplierContent } from "./SupplierContent"
import { useAdminSupplierLogic } from "@/hooks/supplier/useAdminSupplierLogic"

export function AdminSupplier() {
    const {
        currentUser,
        isAuthenticated,
        authLoading,
        mounted,
        hasPermission,
        suppliersData,
        displayData,
        stats,
        suppliers,
        currentPage,
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
        setCurrentPage,
        setEditingSupplier
    } = useAdminSupplierLogic()

    if (!mounted || authLoading) return <LoadingSpinner />
    if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
    if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
    if (!isLoading && !isError && suppliersData.length === 0) return <EmptySuppliersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />
    if (isLoading) return <LoadingSuppliersState />
    if (isError) return <ErrorSuppliersState currentUser={currentUser} isCreateModalOpen={isCreateModalOpen} setIsCreateModalOpen={setIsCreateModalOpen} />

    return (
        <AdminSupplierContent
            currentUser={currentUser}
            suppliersData={suppliersData}
            displayData={displayData}
            stats={stats}
            suppliers={suppliers}
            currentPage={currentPage}
            selectedSuppliers={selectedSuppliers}
            isCreateModalOpen={isCreateModalOpen}
            editingSupplier={editingSupplier}
            setIsCreateModalOpen={setIsCreateModalOpen}
            setFilteredSuppliers={setFilteredSuppliers}
            setHasFilter={setHasFilter}
            handleEditSupplier={handleEditSupplier}
            handleRowSelectionChange={handleRowSelectionChange}
            clearSelection={clearSelection}
            setCurrentPage={setCurrentPage}
            setEditingSupplier={setEditingSupplier}
        />
    )
}
