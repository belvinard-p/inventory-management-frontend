"use client"

import { createContext, useContext } from "react"
import { Sale } from "@/types/sale"

interface SaleContextType {
  onEditSale: (sale: Sale) => void
}

const SaleContext = createContext<SaleContextType | undefined>(undefined)

export function SaleProvider({ 
  children, 
  onEditSale 
}: { 
  children: React.ReactNode
  onEditSale: (sale: Sale) => void
}) {
  return (
    <SaleContext.Provider value={{ onEditSale }}>
      {children}
    </SaleContext.Provider>
  )
}

export function useSaleContext() {
  const context = useContext(SaleContext)
  if (context === undefined) {
    throw new Error('useSaleContext must be used within a SaleProvider')
  }
  return context
}