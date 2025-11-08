"use client"

import { Row } from "@tanstack/react-table"
import { Company } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Image,
  ExternalLink,
  Eye
} from "lucide-react"
import { useCompanies } from "@/hooks/useCompany"
import { useCompanyContext } from "./CompanyContext"
import { DeleteConfirmDialog } from "@/components/global/DeleteConfirmDialog"
import { ImageUploadDialog } from "./ImageUploadDialog"
import { CompanyDetailsDialog } from "./CompanyDetailsDialog"
import { useState } from "react"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const company = row.original as Company
  const { onEditCompany } = useCompanyContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const { deleteCompany } = useCompanies()

  return (
    <>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/50 data-[state=open]:bg-muted transition-colors duration-200 rounded-md"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  <span className="sr-only">Actions pour {company.name}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions entreprise</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-[200px] shadow-lg border-border/50">
          <DropdownMenuItem 
            onClick={() => setIsDetailsDialogOpen(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Détails</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onEditCompany(company)} className="text-green-600 hover:text-green-700">
            <Edit className="mr-2 h-4 w-4" />
            <span>Modifier</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsImageDialogOpen(true)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Image className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Changer image</span>
          </DropdownMenuItem>
          
          {company.website && (
            <DropdownMenuItem 
              onClick={() => window.open(`https://${company.website}`, '_blank')}
              className="text-green-600 hover:text-green-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Visiter site</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            className="text-red-600 hover:text-red-700 focus:text-red-700"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Supprimer</span>
            <DropdownMenuShortcut className="text-red-600">⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          deleteCompany(company.id)
          setIsDeleteDialogOpen(false)
        }}
        itemName={company.name}
        isLoading={false}
      />
      
      <ImageUploadDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        company={company}
      />
      
      <CompanyDetailsDialog
        company={company}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </>
  )
}