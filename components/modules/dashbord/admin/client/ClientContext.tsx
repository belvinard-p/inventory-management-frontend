"use client"

import { createContext, useContext } from "react"
import { ClientResponse } from "@/types/client/client"

interface ClientContextType {
  onEditClient: (client: ClientResponse) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ 
  children, 
  onEditClient 
}: { 
  children: React.ReactNode
  onEditClient: (client: ClientResponse) => void
}) {
  return (
    <ClientContext.Provider value={{ onEditClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}