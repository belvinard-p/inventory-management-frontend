"use client"

import { SupplierOrder, OrderStatus } from "@/types/supplier/supplierOrder"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { ORDER_STATUS_CONFIG } from "@/lib/orderStatusUtils"

interface CmdSupplierStatusDialogProps {
    order: SupplierOrder
    open: boolean
    onOpenChange: (open: boolean) => void
    onStatusChange: (orderId: number, newStatus: OrderStatus) => Promise<void>
    isLoading?: boolean
}

interface StatusOption {
    value: OrderStatus
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        value: OrderStatus.PENDING,
        label: "En attente",
        variant: "secondary",
    },
    {
        value: OrderStatus.CONFIRMED,
        label: "Confirmée",
        variant: "default",
    },
    {
        value: OrderStatus.COMPLETED,
        label: "Complétée",
        variant: "outline",
    },
    {
        value: OrderStatus.CANCELLED,
        label: "Annulée",
        variant: "destructive",
    },
]

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.PENDING],
    [OrderStatus.CANCELLED]: [OrderStatus.PENDING],
    [OrderStatus.COMPLETED]: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
}

export function CmdSupplierStatusDialog({
    order,
    open,
    onOpenChange,
    onStatusChange,
    isLoading = false,
}: CmdSupplierStatusDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>(order.stateOrder?.toUpperCase() || "")
    const [isUpdating, setIsUpdating] = useState(false)

    const currentStatus = order.stateOrder?.toUpperCase() as OrderStatus
    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || []

    const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus)

    const handleConfirm = async () => {
        if (selectedStatus === currentStatus || isUpdating) return

        setIsUpdating(true)
        try {
            await onStatusChange(order.id, selectedStatus as OrderStatus)
            onOpenChange(false)
        } catch (error: unknown) {
            const err = error as { details?: { errors?: { details?: string }; message?: string }; message?: string }
            const errorMessage = err?.details?.errors?.details || 
                               err?.details?.message || 
                               err?.message || 
                               "Erreur lors du changement de statut"
            
            toast.error("Changement de statut impossible", {
                description: errorMessage
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const isStatusAllowed = (status: OrderStatus) => {
        return allowedStatuses.includes(status)
    }

    const hasChanges = selectedStatus !== currentStatus && selectedStatus !== order.stateOrder
    const isSelectedStatusAllowed = isStatusAllowed(selectedStatus as OrderStatus)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", currentStatusOption?.variant === "secondary" ? "bg-amber-50" : currentStatusOption?.variant === "default" ? "bg-blue-50" : currentStatusOption?.variant === "outline" ? "bg-green-50" : "bg-red-50")}>
                            <Package className={cn("h-5 w-5", currentStatusOption?.variant === "secondary" ? "text-amber-600" : currentStatusOption?.variant === "default" ? "text-blue-600" : currentStatusOption?.variant === "outline" ? "text-green-600" : "text-red-600")} />
                        </div>
                        Changer le statut
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Commande <span className="font-semibold text-foreground">{order.code}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Statut actuel
                        </label>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border-2 border-primary/20">
                            <div className="flex-1">
                                <Badge variant={currentStatusOption?.variant}>
                                    {currentStatusOption?.label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Nouveau statut
                        </label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => {
                                    const isCurrent = status.value === currentStatus
                                    const isAllowed = isStatusAllowed(status.value)
                                    const isDisabled = !isAllowed && !isCurrent

                                    return (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                            disabled={isDisabled}
                                            className={cn(
                                                "cursor-pointer",
                                                isDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge variant={status.variant} className="text-xs">
                                                    {status.label}
                                                </Badge>
                                                {isCurrent && (
                                                    <span className="text-xs text-muted-foreground">(Actuel)</span>
                                                )}
                                                {!isAllowed && !isCurrent && (
                                                    <span className="text-xs text-muted-foreground">(Non autorisé)</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium">Transitions disponibles</p>
                            <p className="text-blue-700 mt-1">
                                Depuis &quot;{currentStatusOption?.label}&quot;, vous pouvez passer à : {allowedStatuses.map(s => STATUS_OPTIONS.find(opt => opt.value === s)?.label).join(", ")}
                            </p>
                        </div>
                    </div>

                    {!isSelectedStatusAllowed && hasChanges && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-900">
                                <p className="font-medium">Transition non autorisée</p>
                                <p className="text-red-700 mt-1">
                                    Cette transition n&apos;est pas permise selon les règles métier.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isUpdating}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!hasChanges || !isSelectedStatusAllowed || isUpdating || isLoading}
                        className="min-w-[100px]"
                    >
                        {isUpdating ? "Mise à jour..." : "Confirmer"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}