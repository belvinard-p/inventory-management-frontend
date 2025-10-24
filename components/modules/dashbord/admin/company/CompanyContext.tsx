"use client"

import { createContext, useContext } from "react"
import { Company } from "@/types"

interface CompanyContextType {
  onEditCompany: (company: Company) => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ 
  children, 
  onEditCompany 
}: { 
  children: React.ReactNode
  onEditCompany: (company: Company) => void
}) {
  return (
    <CompanyContext.Provider value={{ onEditCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompanyContext() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider')
  }
  return context
}