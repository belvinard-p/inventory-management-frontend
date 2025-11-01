"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package, AlertTriangle, ShoppingCart, Archive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleProvider } from "./ArticleContext"
import { ArticleSearch } from "./ArticleSearch"
import { BulkActions } from "./BulkActions"
import { DataTable } from "../company/DataTable"
import { columns } from "./Columns"
import { EmptyState } from "@/components/global"
import { ArticleForm } from "./ArticleForm"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { ArticleResponse } from "@/types/article"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface AdminArticleContentProps {
  readonly currentUser: { roleName: string } | null
  readonly articlesData: ArticleResponse[]
  readonly displayData: ArticleResponse[]
  readonly stats: {
    readonly total: number
    readonly active: number
    readonly archived: number
    readonly withImage: number
    readonly lowStock: number
    readonly outOfStock: number
  }
  readonly articles: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly selectedArticles: ArticleResponse[]
  readonly isCreateModalOpen: boolean
  readonly editingArticle: ArticleResponse | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly setFilteredArticles: (articles: ArticleResponse[]) => void
  readonly setHasFilter: (hasFilter: boolean) => void
  readonly handleEditArticle: (article: ArticleResponse) => void
  readonly handleRowSelectionChange: (selection: unknown) => void
  readonly clearSelection: () => void
  readonly setCurrentPage: (page: number) => void
  readonly setEditingArticle: (article: ArticleResponse | null) => void
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-${colorClass}/10 hover:-translate-y-1 before:absolute before:inset-0 before:bg-gradient-to-r before:from-${colorClass}/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium group-hover:text-${colorClass} transition-colors duration-300`}>{title}</CardTitle>
        <div className={`group-hover:scale-110 group-hover:text-${colorClass} transition-all duration-300`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${colorClass} group-hover:scale-105 transition-transform duration-300`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function PaginationComponent({ articles, currentPage, setCurrentPage }: {
  readonly articles: { totalPages: number; totalElements: number } | null | undefined
  readonly currentPage: number
  readonly setCurrentPage: (page: number) => void
}) {
  if (!articles || articles.totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} sur {articles.totalPages} ({articles.totalElements} articles)
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(articles.totalPages, 5) }, (_, i) => {
            let pageIndex = i
            if (articles.totalPages > 5) {
              if (currentPage < 3) {
                pageIndex = i
              } else if (currentPage > articles.totalPages - 4) {
                pageIndex = articles.totalPages - 5 + i
              } else {
                pageIndex = currentPage - 2 + i
              }
            }
            
            return (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  onClick={() => setCurrentPage(pageIndex)}
                  isActive={currentPage === pageIndex}
                  className="cursor-pointer"
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(articles.totalPages - 1, currentPage + 1))}
              className={currentPage === articles.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              size="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function AdminArticleContent({
  currentUser,
  articlesData,
  displayData,
  stats,
  articles,
  currentPage,
  selectedArticles,
  isCreateModalOpen,
  editingArticle,
  setIsCreateModalOpen,
  setFilteredArticles,
  setHasFilter,
  handleEditArticle,
  handleRowSelectionChange,
  clearSelection,
  setCurrentPage,
  setEditingArticle
}: AdminArticleContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_MANAGER'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            Gérez les articles de votre inventaire
          </p>
        </div>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Article
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<Package className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Actifs" 
          value={stats.active} 
          icon={<ShoppingCart className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
        <StatsCard 
          title="Archivés" 
          value={stats.archived} 
          icon={<Archive className="h-4 w-4 text-gray-600" />}
          colorClass="gray-600"
        />
        <StatsCard 
          title="Avec image" 
          value={stats.withImage} 
          icon={<Package className="h-4 w-4 text-blue-600" />}
          colorClass="blue-600"
        />
        <StatsCard 
          title="Stock faible" 
          value={stats.lowStock} 
          icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
          colorClass="orange-600"
        />
        <StatsCard 
          title="Rupture" 
          value={stats.outOfStock} 
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          colorClass="red-600"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <ArticleSearch 
              data={articlesData}
              onFilteredData={(filtered, hasFilter = true) => {
                setFilteredArticles(filtered)
                setHasFilter(hasFilter)
              }}
              placeholder="Rechercher article"
            />
          </div>
          
          <BulkActions 
            selectedArticles={selectedArticles}
            onClearSelection={clearSelection}
          />
          
          {displayData.length === 0 ? (
            <EmptyState 
              title="Aucun résultat"
              description="Aucun article ne correspond aux filtres actuels"
            />
          ) : (
            <ArticleProvider onEditArticle={handleEditArticle}>
              <DataTable 
                columns={columns} 
                data={displayData}
                onRowSelectionChange={handleRowSelectionChange}
                enablePagination={false}
                enableToolbar={true}
              />
            </ArticleProvider>
          )}
          
          <PaginationComponent 
            articles={articles}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ArticleForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      <ArticleForm
        open={!!editingArticle}
        onOpenChange={(open) => !open && setEditingArticle(null)}
        article={editingArticle}
        mode="edit"
      />
    </div>
  )
}

