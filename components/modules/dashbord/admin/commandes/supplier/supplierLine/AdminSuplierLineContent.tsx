"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package, Hash, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CmdSupplierLineProvider } from "./CmdSupplierLineContext"
import { CmdSupplierLineSearch } from "./CmdSupplierLineSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../../../company/DataTable"
import { createColumns } from "./Columns"
import { EmptyState } from "@/components/global"
import { CmdSupplierForm } from "./CmdSupplierForm"
import type { SupplierOrderLine } from "@/types/supplier/supplierOrderLine"

interface StatsCardProps {
    readonly title: string
    readonly value: number | string
    readonly icon: React.ReactNode
    readonly colorClass: string
}

interface AdminSupplierLineContentProps {
    readonly currentUser: { roleName: string } | null
    readonly linesData: SupplierOrderLine[]
    readonly displayData: SupplierOrderLine[]
    readonly stats: {
        readonly total: number
        readonly totalAmount: number
        readonly uniqueArticles: number
        readonly averageQuantity: number
    }
    readonly selectedLines: SupplierOrderLine[]
    readonly isCreateModalOpen: boolean
    readonly editingLine: SupplierOrderLine | null
    readonly setIsCreateModalOpen: (open: boolean) => void
    readonly setFilteredLines: (lines: SupplierOrderLine[]) => void
    readonly setHasFilter: (hasFilter: boolean) => void
    readonly handleEditLine: (line: SupplierOrderLine) => void
    readonly handleRowSelectionChange: (selection: unknown) => void
    readonly clearSelection: () => void
    readonly setEditingLine: (line: SupplierOrderLine | null) => void
    readonly handleDelete: (id: number) => Promise<void>
    readonly handleUpdateQuantity: (id: number, quantity: number) => Promise<void>
    readonly handleBulkDelete: (ids: number[]) => Promise<void>
    readonly isLoading: boolean
    readonly supplierOrderId?: number
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
    return (
        <Card className={`group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-${colorClass}/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-${colorClass}/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
                <CardTitle className={`text-xs sm:text-sm font-medium group-hover:text-${colorClass} transition-colors duration-300 truncate`}>{title}</CardTitle>
                <div className={`group-hover:scale-110 group-hover:text-${colorClass} transition-all duration-300 flex-shrink-0`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <div className={`text-xl sm:text-2xl font-bold text-${colorClass} group-hover:scale-105 transition-transform duration-300`}>{value}</div>
            </CardContent>
        </Card>
    )
}

export function AdminSupplierLineContent({
    currentUser,
    linesData,
    displayData,
    stats,
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
    isLoading,
    supplierOrderId,
}: AdminSupplierLineContentProps) {
    const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

    // Create columns with handlers
    const columns = createColumns({
        onDelete: handleDelete,
        onUpdateQuantity: handleUpdateQuantity,
        isLoading: isLoading,
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {supplierOrderId ? "Articles de la commande" : "Toutes les lignes de commandes"}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {supplierOrderId ? "Gérez les articles de cette commande" : "Gérez toutes les lignes de commandes fournisseurs"}
                    </p>
                </div>

                {hasPermission && (
                    <Button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Ajouter une ligne de commande</span>
                        <span className="sm:hidden">Ajouter</span>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Lignes"
                    value={stats.total}
                    icon={<Package className="h-4 w-4 text-primary" />}
                    colorClass="primary"
                />
                <StatsCard
                    title="Articles Uniques"
                    value={stats.uniqueArticles}
                    icon={<Package className="h-4 w-4 text-primary" />}
                    colorClass="primary"
                />
                <StatsCard
                    title="Quantité Moyenne"
                    value={stats.averageQuantity}
                    icon={<Hash className="h-4 w-4 text-blue-600" />}
                    colorClass="blue-600"
                />
                <StatsCard
                    title="Montant Total"
                    value={`${stats.totalAmount.toFixed(2)} xaf`}
                    icon={<DollarSign className="h-4 w-4 text-primary" />}
                    colorClass="primary"
                />
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">Liste des lignes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CmdSupplierLineSearch
                            data={linesData}
                            onFilteredData={(filtered, hasFilter = true) => {
                                setFilteredLines(filtered)
                                setHasFilter(hasFilter)
                            }}
                            placeholder="Filtrer les lignes"
                        />
                    </div>

                    <BulkActions
                        selectedLines={selectedLines}
                        onClearSelection={clearSelection}
                        onBulkDelete={handleBulkDelete}
                    />

                    <div className="overflow-x-auto">
                        {displayData.length === 0 ? (
                            <EmptyState
                                title="Aucun résultat"
                                description="Aucun article ne correspond aux filtres actuels"
                            />
                        ) : (
                            <CmdSupplierLineProvider onEditLine={handleEditLine}>
                                <DataTable
                                    columns={columns}
                                    data={displayData}
                                    onRowSelectionChange={handleRowSelectionChange}
                                    enablePagination={false}
                                    enableToolbar={true}
                                />
                            </CmdSupplierLineProvider>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <CmdSupplierForm
                key="create-line-form"
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                supplierOrderId={supplierOrderId}
            />

            {editingLine && (
                <CmdSupplierForm
                    key="edit-line-form"
                    open={!!editingLine}
                    onOpenChange={(open) => !open && setEditingLine(null)}
                    line={editingLine}
                    supplierOrderId={supplierOrderId}
                />
            )}
        </div>
    )
}
