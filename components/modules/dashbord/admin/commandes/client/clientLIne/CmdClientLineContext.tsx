"use client"

import { createContext, useContext } from "react"
import { OrderClientLineResponse } from "@/types/client/orderClientLine"

interface CmdClientLineContextType {
  onEditLine: (line: OrderClientLineResponse) => void
}

const CmdClientLineContext = createContext<CmdClientLineContextType | undefined>(undefined)

export function CmdClientLineProvider({ 
  children, 
  onEditLine 
}: { 
  children: React.ReactNode
  onEditLine: (line: OrderClientLineResponse) => void
}) {
  return (
    <CmdClientLineContext.Provider value={{ onEditLine }}>
      {children}
    </CmdClientLineContext.Provider>
  )
}

export function useCmdClientLineContext() {
  const context = useContext(CmdClientLineContext)
  if (context === undefined) {
    throw new Error('useCmdClientLineContext must be used within a CmdClientLineProvider')
  }
  return context
}
