"use client"

import { createContext, useContext } from "react"
import { SupplierOrder } from "@/types/supplier/supplierOrder"

interface CmdSupplierContextType {
  onEditOrder: (order: SupplierOrder) => void
}

const CmdSupplierContext = createContext<CmdSupplierContextType | undefined>(undefined)

export function CmdSupplierProvider({ 
  children, 
  onEditOrder 
}: { 
  children: React.ReactNode
  onEditOrder: (order: SupplierOrder) => void
}) {
  return (
    <CmdSupplierContext.Provider value={{ onEditOrder }}>
      {children}
    </CmdSupplierContext.Provider>
  )
}

export function useCmdSupplierContext() {
  const context = useContext(CmdSupplierContext)
  if (context === undefined) {
    throw new Error('useCmdSupplierContext must be used within a CmdSupplierProvider')
  }
  return context
}