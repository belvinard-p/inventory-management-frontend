import { createContext, useContext } from "react"
import { Category } from "@/types/category"

interface CategoryContextType {
  categories: Category[]
  selectedCategories: string[]
  isCreateModalOpen: boolean
  editingCategory: Category | null
  onEditCategory: (category: Category | null) => void
  onCreateClick: () => void
  onCloseModal: () => void
  onRowSelectionChange: (selected: string[]) => void
  onPageChange: (page: number) => void
  currentPage: number
}

export const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
)

export function useCategoryContext() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider"
    )
  }
  return context
}
