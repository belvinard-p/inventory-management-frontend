"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Supplier } from '@/types/supplier/supplier'

interface SupplierSearchProps {
    readonly data: Supplier[]
    readonly onFilteredData: (filtered: Supplier[], hasFilter?: boolean) => void
    readonly placeholder?: string
}

export function SupplierSearch({
    data,
    onFilteredData,
    placeholder = "Rechercher fournisseur..."
}: SupplierSearchProps) {
    const [selectValue, setSelectValue] = React.useState("")
    const isFiltered = selectValue !== "" && selectValue !== "all"

    const handleFilterChange = (value: string) => {
        setSelectValue(value)

        if (value === "all" || value === "") {
            onFilteredData(data, false)
            return
        }

        const filtered = data.filter(supplier => {
            switch (value) {
                case "with-phone":
                    return supplier.phoneNumber && supplier.phoneNumber.trim() !== ""
                case "without-phone":
                    return !supplier.phoneNumber || supplier.phoneNumber.trim() === ""
                case "with-orders":
                    return supplier.supplierOrders && supplier.supplierOrders.length > 0
                case "without-orders":
                    return !supplier.supplierOrders || supplier.supplierOrders.length === 0
                default:
                    return true
            }
        })

        onFilteredData(filtered, true)
    }

    const handleReset = () => {
        setSelectValue("")
        onFilteredData(data, false)
    }

    return (
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectValue} onValueChange={handleFilterChange}>
                <SelectTrigger className="h-8 w-full xs:w-[200px] sm:w-[220px]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les fournisseurs</SelectItem>
                    <SelectItem value="with-phone">Avec téléphone</SelectItem>
                    <SelectItem value="without-phone">Sans téléphone</SelectItem>
                    <SelectItem value="with-orders">Avec commandes</SelectItem>
                    <SelectItem value="without-orders">Sans commandes</SelectItem>
                </SelectContent>
            </Select>
            {isFiltered && (
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="h-8 px-2 lg:px-3"
                >
                    Réinitialiser
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
