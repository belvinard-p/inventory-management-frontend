"use client"

import dynamic from "next/dynamic"

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

export default function LineCmdClientPage() {
  return <AdminAllCmdClientLinesPage />
}