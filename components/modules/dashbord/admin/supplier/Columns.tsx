"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@/types/supplier/supplier"
import { DataTableColumnHeader } from "../company/DataTableColumnHeader"
import { SupplierDataTableRowActions } from "./SupplierDataTableRowActions"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import { Phone, Package } from "lucide-react"

export const columns: ColumnDef<Supplier>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                className="translate-y-[2px] w-full md:w-auto"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
        cell: ({ row }) => {
            const name = String(row.getValue("name"))
            return (
                <div className="flex items-center gap-2 group">
                    <span className="font-medium flex-1">{name}</span>
                    <CopyButton
                        text={name}
                        label="Nom du fournisseur"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </div>
            )
        },
    },
    {
        accessorKey: "phoneNumber",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Téléphone" />
        ),
        cell: ({ row }) => {
            const phoneNumber = row.getValue("phoneNumber") ? String(row.getValue("phoneNumber")) : undefined
            return (
                <div className="flex items-center gap-2 group">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono flex-1">{phoneNumber || "N/A"}</span>
                    {phoneNumber && (
                        <CopyButton
                            text={phoneNumber}
                            label="Téléphone"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "supplierOrders",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Commandes" />
        ),
        cell: ({ row }) => {
            const orders: Supplier["supplierOrders"] = row.getValue("supplierOrders")
            const orderCount = orders?.length || 0
            return (
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={orderCount > 0 ? "default" : "secondary"}>
                        {orderCount} commande{orderCount === 1 ? '' : 's'}
                    </Badge>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <SupplierDataTableRowActions row={row} />,
    },
]
