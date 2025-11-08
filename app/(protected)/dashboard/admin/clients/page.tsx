'use client'

import dynamic from "next/dynamic"

const AdminClientPage = dynamic(
  () => import('@/components/modules/dashbord/admin/client').then(mod => ({ default: mod.AdminClientPage })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function ClientPage() {
  return <AdminClientPage />
}