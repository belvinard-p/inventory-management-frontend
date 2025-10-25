"use client"

import { useInfiniteCompanies } from "@/hooks/useCompany"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { CompanyTableSkeleton } from "./CompanyTableSkeleton"
import { DataTable } from "./DataTable"
import { columns } from "./Columns"
import { CompanyProvider } from "./CompanyContext"
import { Company } from "@/types"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface InfiniteCompanyListProps {
  readonly onEditCompany: (company: Company) => void
}

export function InfiniteCompanyList({ onEditCompany }: InfiniteCompanyListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteCompanies(20) // 20 entreprises par page

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => { void fetchNextPage() }
  })

  if (isLoading) {
    return <CompanyTableSkeleton />
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erreur lors du chargement des entreprises</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Réessayer
        </Button>
      </div>
    )
  }

  // Aplatir toutes les pages en une seule liste
  const allCompanies = data?.pages.flatMap(page => (page as { content: Company[] }).content) || []

  return (
    <div className="space-y-4">
      <CompanyProvider onEditCompany={onEditCompany}>
        <DataTable columns={columns} data={allCompanies} />
      </CompanyProvider>

      {/* Trigger pour le scroll infini */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Chargement...</span>
          </div>
        )}
        
        {hasNextPage && !isFetchingNextPage && (
          <Button variant="outline" onClick={() => { void fetchNextPage() }}>
            Charger plus d&apos;entreprises
          </Button>
        )}
        
        {!hasNextPage && allCompanies.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Toutes les entreprises ont été chargées ({allCompanies.length} au total)
          </p>
        )}
      </div>
    </div>
  )
}