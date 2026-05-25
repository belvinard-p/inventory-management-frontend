"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, FileText, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "../company/DataTable"
import { EmptyState } from "@/components/global"
import { SaleForm } from "./SaleForm"
import { SaleDataTableRowActions } from "./SaleDataTableRowActions"
import { SaleSearch } from "./SaleSearch"
import { SaleDetailsDialog } from "./SaleDetailsDialog"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { Sale, SaleStatus } from "@/types/sale"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../company/DataTableColumnHeader"

interface StatsCardProps {
  readonly title: string
  readonly value: number
  readonly icon: React.ReactNode
  readonly colorClass: string
}

interface SaleContentProps {
  readonly currentUser: { roleName: string } | null
  readonly salesData: Sale[]
  readonly displayData: Sale[]
  readonly stats: {
    readonly total: number
    readonly draft: number
    readonly confirmed: number
    readonly cancelled: number
    readonly withLines: number
    readonly withoutLines: number
  }
  readonly isCreateModalOpen: boolean
  readonly editingSale: Sale | null
  readonly setIsCreateModalOpen: (open: boolean) => void
  readonly handleEditSale: (sale: Sale) => void
  readonly setEditingSale: (sale: Sale | null) => void
  readonly isLoading: boolean
  readonly onFilteredData: (filtered: Sale[], hasFilter?: boolean) => void
  readonly selectedSale: Sale | null
  readonly setSelectedSale: (sale: Sale | null) => void
  readonly onSaleUpdate: () => void
}

function StatsCard({ title, value, icon, colorClass }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
        <CardTitle className="text-xs sm:text-sm font-medium truncate">{title}</CardTitle>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

const getStatusBadge = (status: SaleStatus) => {
  switch (status) {
    case SaleStatus.DRAFT:
      return <Badge variant="secondary">Brouillon</Badge>
    case SaleStatus.CONFIRMED:
      return <Badge variant="default">Confirmée</Badge>
    case SaleStatus.CANCELLED:
      return <Badge variant="destructive">Annulée</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function SaleContent({
  currentUser,
  salesData,
  displayData,
  stats,
  isCreateModalOpen,
  editingSale,
  setIsCreateModalOpen,
  handleEditSale,
  setEditingSale,
  isLoading,
  onFilteredData,
  selectedSale,
  setSelectedSale,
  onSaleUpdate,
}: SaleContentProps) {
  const hasPermission = currentUser?.roleName === 'ROLE_ADMIN' || currentUser?.roleName === 'ROLE_SALES'

  const columns: ColumnDef<Sale>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        const code = row.getValue("code") as string
        return (
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{code}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "clientName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
    },
    {
      accessorKey: "clientOrderCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commande" />
      ),
    },
    {
      accessorKey: "saleDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("saleDate") as string
        return format(new Date(date), "PP", { locale: fr })
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Statut" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as SaleStatus
        return getStatusBadge(status)
      },
    },
    {
      accessorKey: "saleLines",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lignes" />
      ),
      cell: ({ row }) => {
        const lines = row.getValue("saleLines") as Sale["saleLines"]
        const lineCount = lines?.length || 0
        return (
          <Badge variant={lineCount > 0 ? "default" : "secondary"}>
            {lineCount} ligne{lineCount !== 1 ? 's' : ''}
          </Badge>
        )
      },
    },
    {
      accessorKey: "comments",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentaires" />
      ),
      cell: ({ row }) => {
        const comments = row.getValue("comments") as string
        return comments ? (
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {comments}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <SaleDataTableRowActions 
          row={row} 
          onEdit={handleEditSale}
          onView={setSelectedSale}
          isLoading={isLoading}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ventes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les ventes de votre système
          </p>
        </div>

        {hasPermission && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Vente
          </Button>
        )}
      </div>

      <SaleSearch 
        data={salesData}
        onFilteredData={onFilteredData}
        placeholder="Filtrer les ventes..."
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard 
          title="Total" 
          value={stats.total} 
          icon={<Receipt className="h-4 w-4 text-primary" />}
          colorClass="primary"
        />
        <StatsCard 
          title="Brouillons" 
          value={stats.draft} 
          icon={<FileText className="h-4 w-4 text-gray-600" />}
          colorClass="gray-600"
        />
        <StatsCard 
          title="Confirmées" 
          value={stats.confirmed} 
          icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
          colorClass="blue-600"
        />
        <StatsCard 
          title="Annulées" 
          value={stats.cancelled} 
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          colorClass="red-600"
        />
        <StatsCard 
          title="Avec lignes" 
          value={stats.withLines} 
          icon={<FileText className="h-4 w-4 text-green-600" />}
          colorClass="green-600"
        />
        <StatsCard 
          title="Sans lignes" 
          value={stats.withoutLines} 
          icon={<FileText className="h-4 w-4 text-yellow-600" />}
          colorClass="yellow-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          {displayData.length === 0 ? (
            <EmptyState 
              title="Aucune vente trouvée"
              description="Aucune vente ne correspond aux critères actuels"
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={displayData}
              enablePagination={true}
              enableToolbar={true}
            />
          )}
        </CardContent>
      </Card>

      <SaleForm
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
      />
      
      <SaleForm
        open={!!editingSale}
        onOpenChange={(open) => !open && setEditingSale(null)}
        sale={editingSale}
        mode="edit"
      />
      
      <SaleDetailsDialog
        sale={selectedSale}
        open={!!selectedSale}
        onOpenChange={(open) => !open && setSelectedSale(null)}
        onSaleUpdate={onSaleUpdate}
      />
    </div>
  )
}