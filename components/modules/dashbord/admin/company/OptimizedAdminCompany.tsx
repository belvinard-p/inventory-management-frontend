"use client"

import React, { useState, useMemo } from "react"
import { useCompanies } from "@/hooks/useCompany"
import { useAuth } from "@/hooks/useAuth"
import { DataTable } from "./DataTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyProvider } from "./CompanyContext"
import { CompanyTableSkeleton } from "./CompanyTableSkeleton"
import { CompanySearch } from "./CompanySearch"
import { BulkActions } from "./BulkActions"
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { List, Grid } from "lucide-react"
import type { Company } from "@/types"
import { toast } from "sonner"
import { CompanyForm } from "./CompanyForm"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function OptimizedAdminCompany() {
  // Authentication and state
  const { user: currentUser } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'infinite'>('table')
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Data fetching
  const pageSize = 10
  const { 
    companies, 
    isLoading: companiesLoading, 
    isError 
  } = useCompanies(currentPage, pageSize)
  
  // Memoized data and calculations
  const currentPageData = useMemo(() => companies?.content || [], [companies])
  
  // Columns configuration
  const columns = useMemo(() => [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phoneNumber" },
    {
      header: "Address",
      accessorKey: "address",
      cell: ({ row }: { row: { original: Company } }) => {
        const address = row.original.address;
        return address ? `${address.address1 || ''} ${address.city || ''} ${address.country || ''}`.trim() : '';
      }
    },
  ], [])

  // Permissions
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || 
                       currentUser?.roleName === 'ROLE_MANAGER'

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!currentPageData.length) return [];
    if (!searchQuery.trim()) return currentPageData;
    
    const query = searchQuery.toLowerCase();
    return currentPageData.filter(company => 
      company.name?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.phoneNumber?.toLowerCase().includes(query) ||
      (company.address && (
        company.address.address1?.toLowerCase().includes(query) ||
        company.address.city?.toLowerCase().includes(query) ||
        company.address.country?.toLowerCase().includes(query)
      ))
    );
  }, [currentPageData, searchQuery]);

  // Event handlers
  const handleRowSelectionChange = (rows: any) => {
    setSelectedCompanies(rows);
  };

  const clearSelection = () => {
    setSelectedCompanies([]);
  };

  // Keyboard shortcuts
  useCommonShortcuts({
    onNew: hasPermission ? () => setIsCreateModalOpen(true) : undefined,
    onEscape: () => {
      if (isCreateModalOpen) setIsCreateModalOpen(false);
      if (editingCompany) setEditingCompany(null);
    }
  });

  // Loading and error states
  if (companiesLoading || !currentPageData) {
    return <CompanyTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Error loading companies. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
        {hasPermission && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="w-full max-w-md">
          <CompanySearch 
            onSearch={setSearchQuery}
            placeholder="Search companies..."
          />
        </div>
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && setViewMode(value as 'table' | 'infinite')}
          className="ml-4"
        >
          <ToggleGroupItem value="table" aria-label="Table view">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="infinite" aria-label="Infinite scroll view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <BulkActions 
          selectedCompanies={selectedCompanies}
          onClearSelection={clearSelection}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <CompanyProvider onEditCompany={setEditingCompany}>
            <DataTable 
              columns={columns} 
              data={viewMode === 'table' ? filteredData : []}
              onRowSelectionChange={handleRowSelectionChange}
              enablePagination={false}
            />
          </CompanyProvider>
        </CardContent>

        {/* Pagination */}
        {companies && companies.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, companies.totalPages) }, (_, i) => {
                  // Show first, last, and pages around current
                  let pageNum: number;
                  if (companies.totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i; // First 5 pages
                  } else if (currentPage > companies.totalPages - 4) {
                    pageNum = companies.totalPages - 5 + i; // Last 5 pages
                  } else {
                    // Middle pages (2 before and 2 after current)
                    pageNum = Math.max(0, Math.min(companies.totalPages - 5, currentPage - 2)) + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(companies.totalPages - 1, p + 1))}
                    disabled={currentPage >= companies.totalPages - 1}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CompanyForm 
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      {editingCompany && (
        <CompanyForm 
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          mode="edit"
          company={editingCompany}
        />
      )}
    </div>
  );
}

export default OptimizedAdminCompany;
