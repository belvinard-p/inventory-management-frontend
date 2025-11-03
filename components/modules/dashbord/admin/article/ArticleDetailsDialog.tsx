"use client"

import { ArticleResponse } from "@/types/article"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Package, Tag, DollarSign, TrendingUp, Calendar, FileText, Hash } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { ArticleStatus } from "@/types/article"
import { ArticleImage } from "./ArticleImage"

interface ArticleDetailsDialogProps {
  article: ArticleResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArticleDetailsDialog({ article, open, onOpenChange }: ArticleDetailsDialogProps) {
  if (!article) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <ArticleImage
              articleId={article.id}
              articleName={article.designation}
              className="h-48 w-48 rounded-2xl object-cover border-4 border-white shadow-lg"
              fallbackClassName="h-48 w-48 rounded-2xl bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg"
              expirationMinutes={15}
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{article.designation}</h2>
              <p className="text-sm text-muted-foreground font-mono bg-white/50 px-3 py-1 rounded-full mt-2">
                {article.codeArticle}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Informations principales
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Code Article</p>
                  <p className="text-sm font-semibold font-mono">{article.codeArticle}</p>
                </div>
                <CopyButton 
                  text={article.codeArticle} 
                  label="Code Article"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Désignation</p>
                  <p className="text-sm font-semibold">{article.designation}</p>
                </div>
                <CopyButton 
                  text={article.designation} 
                  label="Désignation"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                  <p className="text-sm font-semibold">{article.categoryDesignation || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge variant={article.status === ArticleStatus.ACTIVE ? "default" : "secondary"}>
                    {article.status === ArticleStatus.ACTIVE ? "Actif" : "Archivé"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stock et quantités */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Stock et quantités
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-lg ${
                  article.availableQuantity === 0 
                    ? 'bg-red-100 text-red-600' 
                    : article.availableQuantity <= 10 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Quantité disponible</p>
                  <p className={`text-sm font-semibold ${
                    article.availableQuantity === 0 
                      ? 'text-red-600' 
                      : article.availableQuantity <= 10 
                      ? 'text-orange-600' 
                      : ''
                  }`}>
                    {article.availableQuantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Quantité en stock</p>
                  <p className="text-sm font-semibold">{article.quantityInStock || 0}</p>
                </div>
              </div>

              {article.reservedQuantity !== undefined && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Quantité réservée</p>
                    <p className="text-sm font-semibold">{article.reservedQuantity || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prix */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Prix
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Prix unitaire HT</p>
                  <p className="text-sm font-semibold">
                    {article.unitPriceExclTax?.toFixed(2) || '0.00'} xaf
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Prix unitaire TTC</p>
                  <p className="text-sm font-semibold">
                    {article.unitPriceAllTax?.toFixed(2) || '0.00'} xaf
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Taux TVA</p>
                  <p className="text-sm font-semibold">{article.rateTva || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informations
            </h3>
            <div className="space-y-4">
              {article.createdDate && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                    <p className="font-semibold">
                      {format(new Date(article.createdDate), "PP", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
              
              {article.updatedDate && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Mis à jour le</p>
                    <p className="font-semibold">
                      {format(new Date(article.updatedDate), "PP", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

