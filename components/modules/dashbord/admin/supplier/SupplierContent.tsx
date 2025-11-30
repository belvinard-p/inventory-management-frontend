"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierProvider } from "./SupplierContext"
import { SupplierSearch } from "./SupplierSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../company/DataTable"
import { columns } from "./Columns"
import { EmptyState } from "@/components/global"
import { SupplierForm } from "./SupplierForm"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import type { Supplier } from "@/types/supplier/supplier"

interface StatsCardProps {
    readonly title: string
    readonly value: number
    readonly icon: React.ReactNode
    readonly colorClass: string
}

interface AdminSupplierContentProps {
    readonly currentUser: { roleName: string } | null
    readonly suppliersData: Supplier[]
    readonly displayData: Supplier[]
    readonly stats: {
        readonly total: number
        readonly withOrders: number
        readonly withoutOrders: number
        readonly withPhone: number
        readonly withoutPhone: number
    }
    readonly suppliers: { totalPages: number; totalElements: number } | null | undefined
    readonly currentPage: number
    readonly selectedSuppliers: Supplier[]
    readonly isCreateModalOpen: boolean
    readonly editingSupplier: Supplier | null
    readonly setIsCreateModalOpen: (open: boolean) => void
    readonly setFilteredSuppliers: (suppliers: Supplier[]) => void
    readonly setHasFilter: (hasFilter: boolean) => void
    readonly handleEditSupplier: (supplier: Supplier) => void
    readonly handleRowSelectionChange: (selection: unknown) => void
    readonly clearSelection: () => void
    readonly setCurrentPage: (page: number) => void
    readonly setEditingSupplier: (supplier: Supplier | null) => void
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

function PaginationComponent({ suppliers, currentPage, setCurrentPage }: {
    readonly suppliers: { totalPages: number; totalElements: number } | null | undefined
    readonly currentPage: number
    readonly setCurrentPage: (page: number) => void
}) {
    if (!suppliers || suppliers.totalPages <= 1) return null

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                <span className="hidden sm:inline">Page {currentPage + 1} sur {suppliers.totalPages} ({suppliers.totalElements} fournisseurs)</span>
                <span className="sm:hidden">{currentPage + 1}/{suppliers.totalPages}</span>
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            size="default"
                        />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(suppliers.totalPages, 5) }, (_, i) => {
                        let pageIndex = i
                        if (suppliers.totalPages > 5) {
                            if (currentPage < 3) {
                                pageIndex = i
                            } else if (currentPage > suppliers.totalPages - 4) {
                                pageIndex = suppliers.totalPages - 5 + i
                            } else {
                                pageIndex = currentPage - 2 + i
                            }
                        }
                        
                        return (
                            <PaginationItem key={pageIndex}>
                                <PaginationLink
                                    onClick={() => setCurrentPage(pageIndex)}
                                    isActive={currentPage === pageIndex}
                                    className="cursor-pointer"
                                >
                                    {pageIndex + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    })}
                    
                    <PaginationItem>
                        <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(suppliers.totalPages - 1, currentPage + 1))}
                            className={currentPage === suppliers.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            size="default"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export function AdminSupplierContent({
    currentUser,
    suppliersData,
    displayData,
    stats,
    suppliers,
    currentPage,
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
}: AdminSupplierContentProps) {
    const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER' || currentUser?.roleName === 'ROLE_SALES'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fournisseurs</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gérez les fournisseurs de votre système
                    </p>
                </div>

                {hasPermission && (
                    <Button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Nouveau Fournisseur</span>
                        <span className="sm:hidden">Nouveau</span>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                    title="Total"
                    value={stats.total}
                    icon={<Package className="h-4 w-4 text-primary" />}
                    colorClass="primary"
                />
                <StatsCard
                    title="Avec commandes"
                    value={stats.withOrders}
                    icon={<Package className="h-4 w-4 text-green-600" />}
                    colorClass="green-600"
                />
                <StatsCard
                    title="Sans commandes"
                    value={stats.withoutOrders}
                    icon={<Package className="h-4 w-4 text-gray-600" />}
                    colorClass="gray-600"
                />
                <StatsCard
                    title="Avec téléphone"
                    value={stats.withPhone}
                    icon={<Phone className="h-4 w-4 text-blue-600" />}
                    colorClass="blue-600"
                />
                <StatsCard
                    title="Sans téléphone"
                    value={stats.withoutPhone}
                    icon={<Phone className="h-4 w-4 text-orange-600" />}
                    colorClass="orange-600"
                />
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">Liste des Fournisseurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <SupplierSearch
                            data={suppliersData}
                            onFilteredData={(filtered, hasFilter = true) => {
                                setFilteredSuppliers(filtered)
                                setHasFilter(hasFilter)
                            }}
                            placeholder="Rechercher fournisseur"
                        />
                    </div>

                    <BulkActions
                        selectedSuppliers={selectedSuppliers}
                        onClearSelection={clearSelection}
                    />

                    <div className="overflow-x-auto">
                        {displayData.length === 0 ? (
                            <EmptyState
                                title="Aucun résultat"
                                description="Aucun fournisseur ne correspond aux filtres actuels"
                            />
                        ) : (
                            <SupplierProvider onEditSupplier={handleEditSupplier}>
                                <DataTable
                                    columns={columns}
                                    data={displayData}
                                    onRowSelectionChange={handleRowSelectionChange}
                                    enablePagination={false}
                                    enableToolbar={true}
                                />
                            </SupplierProvider>
                        )}
                    </div>
                    
                    <PaginationComponent 
                        suppliers={suppliers}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            <SupplierForm
                key="create-supplier-form"
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                companyId={1}
            />

            <SupplierForm
                key="edit-supplier-form"
                open={!!editingSupplier}
                onOpenChange={(open) => !open && setEditingSupplier(null)}
                supplier={editingSupplier}
                companyId={1}
            />
        </div>
    )
}
