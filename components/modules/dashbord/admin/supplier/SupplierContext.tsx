"use client"

import { createContext, useContext, useMemo } from "react"
import { Supplier } from "@/types/supplier/supplier"

interface SupplierContextType {
    onEditSupplier: (supplier: Supplier) => void
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({
    children,
    onEditSupplier
}: {
    readonly children: React.ReactNode
    readonly onEditSupplier: (supplier: Supplier) => void
}) {
    const value = useMemo(() => ({ onEditSupplier }), [onEditSupplier])

    return (
        <SupplierContext.Provider value={value}>
            {children}
        </SupplierContext.Provider>
    )
}

export function useSupplierContext() {
    const context = useContext(SupplierContext)
    if (context === undefined) {
        throw new Error('useSupplierContext must be used within a SupplierProvider')
    }
    return context
}
