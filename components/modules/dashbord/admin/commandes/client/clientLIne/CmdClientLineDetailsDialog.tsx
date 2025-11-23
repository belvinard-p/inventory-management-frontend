"use client"

import { OrderClientLineResponse } from "@/types/client/orderClientLine"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Package, Hash, DollarSign, FileText, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CmdClientLineDetailsDialogProps {
  line: OrderClientLineResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CmdClientLineDetailsDialog({ line, open, onOpenChange }: CmdClientLineDetailsDialogProps) {
  if (!line) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{line.articleCode || "Article"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{line.articleDesignation || "Désignation non disponible"}</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          {/* Informations de l&apos;article */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Informations de l&apos;article
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Code Article</p>
                  <p className="text-sm font-semibold">{line.articleCode || "N/A"}</p>
                </div>
                {line.articleCode && (
                  <CopyButton
                    text={line.articleCode}
                    label="Code"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Désignation</p>
                  <p className="text-sm font-semibold">
                    {line.articleDesignation || "Non disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de quantité et prix */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Quantité et Prix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <Hash className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Quantité</p>
                  <Badge variant={line.quantity <= 5 ? "destructive" : line.quantity <= 20 ? "secondary" : "default"}>
                    {line.quantity}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Prix Unitaire</p>
                  {line.unitPriceExclTax?.toFixed(2) ?? "0.00"} xaf

                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors sm:col-span-2">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Prix Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {line.totalLinePrice?.toFixed(2) ?? "0.00"} xaf
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires si disponibles */}
          {(line.unitPriceExclTax || line.rateTva || line.unitPriceAllTax) && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Détails fiscaux
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {line.unitPriceExclTax && (
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Prix HT</p>
                    <p className="text-sm font-semibold">{line.unitPriceExclTax.toFixed(2)} xaf</p>
                  </div>
                )}
                {line.rateTva && (
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Taux TVA</p>
                    <p className="text-sm font-semibold">{line.rateTva}%</p>
                  </div>
                )}
                {line.unitPriceAllTax && (
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Prix TTC</p>
                    <p className="text-sm font-semibold">{line.unitPriceAllTax.toFixed(2)} xaf</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
