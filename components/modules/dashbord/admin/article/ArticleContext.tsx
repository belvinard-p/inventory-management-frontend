"use client"

import { createContext, useContext } from "react"
import { ArticleResponse } from "@/types/article"

interface ArticleContextType {
  onEditArticle: (article: ArticleResponse) => void
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined)

export function ArticleProvider({ 
  children, 
  onEditArticle 
}: { 
  children: React.ReactNode
  onEditArticle: (article: ArticleResponse) => void
}) {
  return (
    <ArticleContext.Provider value={{ onEditArticle }}>
      {children}
    </ArticleContext.Provider>
  )
}

export function useArticleContext() {
  const context = useContext(ArticleContext)
  if (context === undefined) {
    throw new Error('useArticleContext must be used within an ArticleProvider')
  }
  return context
}


