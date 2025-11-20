"use client"

import { createContext, useContext } from "react"
import { ClientOrderResponse } from "@/types/client/clientOrder"

interface CmdClientContextType {
  onEditOrder: (order: ClientOrderResponse) => void
}

const CmdClientContext = createContext<CmdClientContextType | undefined>(undefined)

export function CmdClientProvider({ 
  children, 
  onEditOrder 
}: { 
  children: React.ReactNode
  onEditOrder: (order: ClientOrderResponse) => void
}) {
  return (
    <CmdClientContext.Provider value={{ onEditOrder }}>
      {children}
    </CmdClientContext.Provider>
  )
}

export function useCmdClientContext() {
  const context = useContext(CmdClientContext)
  if (context === undefined) {
    throw new Error('useCmdClientContext must be used within a CmdClientProvider')
  }
  return context
}
