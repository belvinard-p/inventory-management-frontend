"use client"

import { Row } from "@tanstack/react-table"
import { ArticleResponse } from "@/types/article"
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
  Eye
} from "lucide-react"
import { useArticles } from "@/hooks/article/useArticle"
import { useArticleContext } from "./ArticleContext"
import { DeleteConfirmDialog } from "@/components/global"
import { ArticleDetailsDialog } from "./ArticleDetailsDialog"
import { ImageUploadDialog } from "./ImageUploadDialog"
import { useState } from "react"

interface ArticleDataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function ArticleDataTableRowActions<TData>({
  row,
}: ArticleDataTableRowActionsProps<TData>) {
  const article = row.original as ArticleResponse
  const { onEditArticle } = useArticleContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const { deleteArticle } = useArticles()

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
                  <span className="sr-only">Actions pour {article.designation}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Actions article</p>
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
          
          <DropdownMenuItem onClick={() => onEditArticle(article)} className="text-green-600 hover:text-green-700">
            <Edit className="mr-2 h-4 w-4" />
            <span>Modifier</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsImageDialogOpen(true)}
            className="text-purple-600 hover:text-purple-700"
          >
            <Image className="mr-2 h-4 w-4" />
            <span>Changer image</span>
          </DropdownMenuItem>
          
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
          deleteArticle(article.id)
          setIsDeleteDialogOpen(false)
        }}
        itemName={article.designation}
        isLoading={false}
      />
      
      <ArticleDetailsDialog
        article={article}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
      
      <ImageUploadDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        article={article}
      />
    </>
  )
}

