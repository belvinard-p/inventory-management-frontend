"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"

const AdminAllCmdSupplierLinesPage = dynamic(
  () => import('@/components/modules/dashbord/admin/commandes/supplier/supplierLine').then(mod => ({ default: mod.AdminAllCmdSupplierLinesPage })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function LineCmdFournisseurPage() {
  return <AdminAllCmdSupplierLinesPage />
}