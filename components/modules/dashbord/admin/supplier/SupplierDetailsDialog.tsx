"use client"

import { Supplier } from "@/types/supplier/supplier"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { CopyButton } from "@/components/ui/copy-button"
import { Building2, Phone, Package, Calendar } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface SupplierDetailsDialogProps {
    readonly supplier: Supplier | null
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
}

export function SupplierDetailsDialog({ supplier, open, onOpenChange }: SupplierDetailsDialogProps) {
    if (!supplier) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
                            <Building2 className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{supplier.name}</h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                {supplier.phoneNumber || "Aucun téléphone"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="p-8 space-y-8">
                    {/* Informations principales */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Informations principales
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Nom</p>
                                    <p className="text-sm font-semibold">{supplier.name}</p>
                                </div>
                                <CopyButton
                                    text={supplier.name}
                                    label="Nom"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {supplier.phoneNumber && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                                        <p className="text-sm font-semibold font-mono">{supplier.phoneNumber}</p>
                                    </div>
                                    <CopyButton
                                        text={supplier.phoneNumber}
                                        label="Téléphone"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Commandes */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Commandes fournisseur
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Nombre de commandes</p>
                                    <Badge variant={supplier.supplierOrders && supplier.supplierOrders.length > 0 ? "default" : "secondary"}>
                                        {supplier.supplierOrders?.length || 0} commande{(supplier.supplierOrders?.length || 0) === 1 ? '' : 's'}
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
                            {supplier.createdAt && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                                        <p className="font-semibold">
                                            {format(new Date(supplier.createdAt), "PP", { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {supplier.updatedAt && (
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Mis à jour le</p>
                                        <p className="font-semibold">
                                            {format(new Date(supplier.updatedAt), "PP", { locale: fr })}
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
