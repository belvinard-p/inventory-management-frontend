"use client"

import { createContext, useContext } from "react"
import { SupplierOrderLine } from "@/types/supplier/supplierOrderLine"

interface CmdSupplierLineContextType {
    onEditLine: (line: SupplierOrderLine) => void
}

const CmdSupplierLineContext = createContext<CmdSupplierLineContextType | undefined>(undefined)

export function CmdSupplierLineProvider({
    children,
    onEditLine
}: {
    children: React.ReactNode
    onEditLine: (line: SupplierOrderLine) => void
}) {
    return (
        <CmdSupplierLineContext.Provider value={{ onEditLine }}>
            {children}
        </CmdSupplierLineContext.Provider>
    )
}

export function useCmdSupplierLineContext() {
    const context = useContext(CmdSupplierLineContext)
    if (context === undefined) {
        throw new Error('useCmdSupplierLineContext must be used within a CmdSupplierLineProvider')
    }
    return context
}
