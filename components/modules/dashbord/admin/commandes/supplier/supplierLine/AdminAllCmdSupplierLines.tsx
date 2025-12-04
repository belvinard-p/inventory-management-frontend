"use client"

import React from "react"
import {
    LoadingSpinner,
    AuthErrorState,
    EmptyLinesState,
    LoadingLinesState,
    ErrorLinesState
} from "./AdminSupplierLineStates"
import { AdminSupplierLineContent } from "./AdminSuplierLineContent"
import { useAdminAllCmdSupplierLinesLogic } from "@/hooks/commandes/cmdSupplier/useAdminAllCmdSupplierLinesLogic"

export function AdminAllCmdSupplierLines() {
    const {
        currentUser,
        isAuthenticated,
        authLoading,
        mounted,
        hasPermission,
        linesData,
        displayData,
        stats,
        isLoading,
        isError,
        selectedLines,
        isCreateModalOpen,
        editingLine,
        setIsCreateModalOpen,
        setFilteredLines,
        setHasFilter,
        handleEditLine,
        handleRowSelectionChange,
        clearSelection,
        setEditingLine,
        handleDelete,
        handleUpdateQuantity,
        handleBulkDelete,
    } = useAdminAllCmdSupplierLinesLogic()

    if (!mounted || authLoading) return <LoadingSpinner />
    if (!isAuthenticated || !currentUser) return <AuthErrorState title="Non authentifié" description="Vous devez être connecté pour accéder à cette page." />
    if (!hasPermission) return <AuthErrorState title="Accès refusé" description="Vous n'avez pas les permissions nécessaires pour accéder à cette page." />
    if (!isLoading && !isError && linesData.length === 0) return (
        <EmptyLinesState
            currentUser={currentUser}
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
            hasPermission={hasPermission}
        />
    )
    if (isLoading) return <LoadingLinesState />
    if (isError) return <ErrorLinesState />

    return (
        <AdminSupplierLineContent
            currentUser={currentUser}
            linesData={linesData}
            displayData={displayData}
            stats={stats}
            selectedLines={selectedLines}
            isCreateModalOpen={isCreateModalOpen}
            editingLine={editingLine}
            setIsCreateModalOpen={setIsCreateModalOpen}
            setFilteredLines={setFilteredLines}
            setHasFilter={setHasFilter}
            handleEditLine={handleEditLine}
            handleRowSelectionChange={handleRowSelectionChange}
            clearSelection={clearSelection}
            setEditingLine={setEditingLine}
            handleDelete={handleDelete}
            handleUpdateQuantity={handleUpdateQuantity}
            handleBulkDelete={handleBulkDelete}
            isLoading={isLoading}
        />
    )
}
