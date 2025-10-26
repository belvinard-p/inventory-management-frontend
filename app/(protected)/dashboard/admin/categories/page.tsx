"use client"

import dynamic from 'next/dynamic'

const AdminCategoryPage = dynamic(
  () => import('@/components/modules/dashbord/admin/category').then(mod => ({ default: mod.AdminCategoryPage })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function CategoriesPage() {
    return <AdminCategoryPage />
}