"use client"

import { Sale, SaleStatus } from "@/types/sale"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Receipt, User, Calendar, MessageSquare, ShoppingCart, FileText, Check, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { saleService } from "@/service/saleService"
import { toast } from "sonner"
import { useState } from "react"

interface SaleDetailsDialogProps {
  sale: Sale | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleUpdate?: () => void
}

export function SaleDetailsDialog({ sale, open, onOpenChange, onSaleUpdate }: SaleDetailsDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!sale) return null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      DRAFT: { label: "Brouillon", variant: "secondary" },
      CONFIRMED: { label: "Confirmée", variant: "default" },
      CANCELLED: { label: "Annulée", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleStatusUpdate = async (saleId: number, status: SaleStatus) => {
    if (!sale) return

    setIsUpdating(true)
    try {
      await saleService.updateStatus(saleId, status)
      const statusLabels = {
        [SaleStatus.CONFIRMED]: 'confirmée',
        [SaleStatus.DRAFT]: 'mise en brouillon',
        [SaleStatus.CANCELLED]: 'annulée',
      }
      toast.success(`Vente ${statusLabels[status] || 'mise à jour'} avec succès`)
      onSaleUpdate?.()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut"
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelSale = async () => {
    if (!sale) return

    setIsUpdating(true)
    try {
      await saleService.cancel(sale.id)
      toast.success("Vente annulée avec succès")
      onSaleUpdate?.()
      onOpenChange(false)
    } catch (error) {
      toast.error("Erreur lors de l'annulation de la vente")
    } finally {
      setIsUpdating(false)
    }
  }

  const canChangeStatus = true
  const canCancel = sale.status === 'DRAFT' || sale.status === 'CONFIRMED'

  const showActions = canChangeStatus || canCancel

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
              <Receipt className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{sale.code}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getStatusBadge(sale.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Informations de la vente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Code de vente</p>
                  <p className="text-sm font-semibold">{sale.code}</p>
                </div>
                <CopyButton
                  text={sale.code}
                  label="Code"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Date de vente</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(sale.saleDate), "PP", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-sm font-semibold">
                    {sale.clientName}
                  </p>
                </div>
              </div>

              {sale.clientOrderCode && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Commande client</p>
                    <p className="text-sm font-semibold">{sale.clientOrderCode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commentaires */}
          {sale.comments && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Commentaires
              </h3>
              <div className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="text-sm text-foreground whitespace-pre-wrap">{sale.comments}</p>
              </div>
            </div>
          )}

          {/* Lignes de vente */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Lignes de vente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Nombre de lignes</p>
                  <Badge variant={sale.saleLines && sale.saleLines.length > 0 ? "default" : "secondary"}>
                    {sale.saleLines?.length || 0} ligne{(sale.saleLines?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* Liste des lignes */}
              {sale.saleLines && sale.saleLines.length > 0 && (
                <div className="space-y-2">
                  {sale.saleLines.map((line, index) => (
                    <div key={line.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{line.articleDesignation}</p>
                        <p className="text-xs text-muted-foreground">Code: {line.articleCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">Qté: {line.quantity}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.unitPrice?.toFixed(2)} FCFA × {line.quantity} = {line.totalPrice?.toFixed(2)} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {canChangeStatus && sale.status === 'DRAFT' && (
                  <Button
                    onClick={() => handleStatusUpdate(sale.id, SaleStatus.CONFIRMED)}
                    disabled={isUpdating}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Confirmer
                  </Button>
                )}
                {canCancel && (
                  <Button
                    onClick={handleCancelSale}
                    disabled={isUpdating}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Annuler la vente
                  </Button>
                )}
              </div>
            </div>
          )}


        </div>
      </DialogContent>
    </Dialog>
  )
}