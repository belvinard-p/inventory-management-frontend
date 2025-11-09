"use client"

import { ClientOrderResponse } from "@/types/client/clientOrder"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Package, User, Calendar, MessageSquare, ShoppingCart, FileText } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface CmdClientDetailsDialogProps {
  order: ClientOrderResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CmdClientDetailsDialog({ order, open, onOpenChange }: CmdClientDetailsDialogProps) {
  if (!order) return null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "En attente", variant: "secondary" },
      CONFIRMED: { label: "Confirmée", variant: "default" },
      COMPLETED: { label: "Complétée", variant: "outline" },
      CANCELLED: { label: "Annulée", variant: "destructive" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{order.code}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getStatusBadge(order.stateOrder)}
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
              Informations de la commande
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Code de commande</p>
                  <p className="text-sm font-semibold">{order.code}</p>
                </div>
                <CopyButton 
                  text={order.code} 
                  label="Code"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Date de commande</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(order.orderDate), "PP", { locale: fr })}
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
                    {order.clientName || `Client #${order.clientId}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          {order.comments && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Commentaires
              </h3>
              <div className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="text-sm text-foreground whitespace-pre-wrap">{order.comments}</p>
              </div>
            </div>
          )}

          {/* Articles de la commande */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Articles de la commande
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Nombre d&apos;articles</p>
                  <Badge variant={order.orderClientLineList && order.orderClientLineList.length > 0 ? "default" : "secondary"}>
                    {order.orderClientLineList?.length || 0} article{(order.orderClientLineList?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* Liste des articles */}
              {order.orderClientLineList && order.orderClientLineList.length > 0 && (
                <div className="space-y-2">
                  {order.orderClientLineList.map((line, index) => (
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

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Informations système
            </h3>
            <div className="space-y-4">
              {order.createdDate && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Créée le</p>
                    <p className="font-semibold">
                      {format(new Date(order.createdDate), "PP 'à' p", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
              
              {order.updatedDate && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Mise à jour le</p>
                    <p className="font-semibold">
                      {format(new Date(order.updatedDate), "PP 'à' p", { locale: fr })}
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
