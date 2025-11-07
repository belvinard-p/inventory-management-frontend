"use client"

import { ClientResponse } from "@/types/client/client"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { User, Mail, Phone, MapPin, ShoppingCart, Calendar } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface ClientDetailsDialogProps {
  client: ClientResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailsDialog({ client, open, onOpenChange }: ClientDetailsDialogProps) {
  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{client.name}</h2>
              <p className="text-sm text-muted-foreground mt-2">{client.email}</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations principales
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-sm font-semibold">{client.name}</p>
                </div>
                <CopyButton 
                  text={client.name} 
                  label="Nom"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{client.email}</p>
                </div>
                <CopyButton 
                  text={client.email} 
                  label="Email"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-semibold font-mono">{client.phoneNumber}</p>
                </div>
                <CopyButton 
                  text={client.phoneNumber} 
                  label="Téléphone"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          {client.address && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Adresse
              </h3>
              <div className="space-y-4">
                {client.address.address1 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Adresse ligne 1</p>
                      <p className="text-sm font-semibold">{client.address.address1}</p>
                    </div>
                  </div>
                )}

                {client.address.address2 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Adresse ligne 2</p>
                      <p className="text-sm font-semibold">{client.address.address2}</p>
                    </div>
                  </div>
                )}

                {client.address.city && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Ville</p>
                      <p className="text-sm font-semibold">{client.address.city}</p>
                    </div>
                  </div>
                )}

                {client.address.postalCode && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Code postal</p>
                      <p className="text-sm font-semibold">{client.address.postalCode}</p>
                    </div>
                  </div>
                )}

                {client.address.country && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Pays</p>
                      <p className="text-sm font-semibold">{client.address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commandes */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Commandes
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Nombre de commandes</p>
                  <Badge variant={client.orders && client.orders.length > 0 ? "default" : "secondary"}>
                    {client.orders?.length || 0} commande{(client.orders?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
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
              {client.createdAt && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                    <p className="font-semibold">
                      {format(new Date(client.createdAt), "PP", { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
              
              {client.updatedAt && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Mis à jour le</p>
                    <p className="font-semibold">
                      {format(new Date(client.updatedAt), "PP", { locale: fr })}
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

