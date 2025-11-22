"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"

const AdminAllCmdClientLinesPage = dynamic(
  () => import('@/components/modules/dashbord/admin/commandes/client/clientLIne').then(mod => ({ default: mod.AdminAllCmdClientLinesPage })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

// AdminCmdClientLinePage est le nom exporté pour AdminCmdClientLine
const AdminCmdClientLinePage = dynamic(
  () => import('@/components/modules/dashbord/admin/commandes/client/clientLIne').then(mod => ({ default: mod.AdminCmdClientLinePage })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function LineCmdClientPage() {
  const searchParams = useSearchParams()
  const clientOrderId = searchParams.get('clientOrderId')
  
  if (clientOrderId) {
    const orderId = parseInt(clientOrderId)
    if (!isNaN(orderId)) {
      return <AdminCmdClientLinePage clientOrderId={orderId} />
    }
  }
  
  return <AdminAllCmdClientLinesPage />
}