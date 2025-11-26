"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Check, X, Building2 } from "lucide-react"
import { Supplier, SupplierRequest } from "@/types/supplier/supplier"
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/supplier/useSupplier"
import { toast } from "sonner"

const supplierSchema = z.object({
    name: z.string()
        .min(3, "Le nom doit contenir au moins 3 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    phoneNumber: z.string()
        .optional()
        .or(z.literal(""))
        .refine(
            (val) => !val || /^(?:(?:\+237|237)[-.\\s]?)?(?:[67][25-9]\d{7}|2\d{2}\d{6})$/.test(val),
            "Le numéro de téléphone doit être un numéro camerounais valide (mobile ou fixe). Exemples: 671234567, 222123456, +237-233123456"
        ),
    companyId: z.number().min(1, "L'ID de l'entreprise est requis"),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
    readonly supplier?: Supplier | null
    readonly companyId: number
}

export function SupplierForm({
    open,
    onOpenChange,
    supplier,
    companyId
}: SupplierFormProps) {
    const isEditMode = !!supplier

    const createMutation = useCreateSupplier()
    const updateMutation = useUpdateSupplier()

    const isLoading = createMutation.isPending || updateMutation.isPending

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            phoneNumber: "",
            companyId: companyId,
        },
    })

    useEffect(() => {
        if (open) {
            if (isEditMode && supplier) {
                form.reset({
                    name: supplier.name,
                    phoneNumber: supplier.phoneNumber || "",
                    companyId: companyId,
                })
            } else {
                form.reset({
                    name: "",
                    phoneNumber: "",
                    companyId: companyId,
                })
            }
        }
    }, [open, supplier, isEditMode, form, companyId])

    const watchedValues = form.watch()

    const hasRequiredFields = watchedValues.name.trim() !== "" && watchedValues.companyId > 0

    const isSubmitDisabled = !hasRequiredFields || isLoading

    async function handleSubmit(data: SupplierFormValues) {
        try {
            const requestData: SupplierRequest = {
                name: data.name,
                phoneNumber: data.phoneNumber || undefined,
                companyId: data.companyId,
            }

            if (isEditMode && supplier) {
                await updateMutation.mutateAsync({ id: supplier.id, data: requestData })
                toast.success("Fournisseur modifié", {
                    description: `${data.name} a été modifié avec succès.`
                })
            } else {
                await createMutation.mutateAsync(requestData)
                toast.success("Fournisseur créé", {
                    description: `${data.name} a été créé avec succès.`
                })
            }

            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Error creating/updating supplier:', error)
            const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
            toast.error("Erreur", {
                description: errorMessage
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-visible z-[9999]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {isEditMode ? "Modifier le fournisseur" : 'Ajouter un fournisseur'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Modifiez les informations du fournisseur."
                            : 'Ajoutez un nouveau fournisseur à votre entreprise.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                                        Nom du fournisseur
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="Ex: Fournisseur ABC"
                                                className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${form.formState.errors.name && form.formState.touchedFields.name
                                                    ? "border-red-400 focus:border-red-500 bg-red-50/50"
                                                    : field.value && !form.formState.errors.name && form.formState.touchedFields.name
                                                        ? "border-green-400 focus:border-green-500 bg-green-50/50"
                                                        : "border-border/40 focus:border-primary/60 focus:bg-background"
                                                    }`}
                                            />
                                            {field.value && form.formState.touchedFields.name && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {form.formState.errors.name ? (
                                                        <X className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                                        Téléphone (optionnel)
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                placeholder="Ex: +33 1 23 45 67 89"
                                                className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${form.formState.errors.phoneNumber && form.formState.touchedFields.phoneNumber
                                                    ? "border-red-400 focus:border-red-500 bg-red-50/50"
                                                    : field.value && !form.formState.errors.phoneNumber && form.formState.touchedFields.phoneNumber
                                                        ? "border-green-400 focus:border-green-500 bg-green-50/50"
                                                        : "border-border/40 focus:border-primary/60 focus:bg-background"
                                                    }`}
                                            />
                                            {field.value && form.formState.touchedFields.phoneNumber && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {form.formState.errors.phoneNumber ? (
                                                        <X className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                className="relative"
                            >
                                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                    <X className="h-3 w-3" />
                                </Badge>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitDisabled} className="relative">
                                {isEditMode ? (
                                    <>
                                        <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-yellow-100 text-yellow-800 border-yellow-200">
                                            <span className="text-xs">✏️</span>
                                        </Badge>
                                        {isLoading ? "Modification..." : "Modifier"}
                                    </>
                                ) : (
                                    <>
                                        <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-100 text-green-800 border-green-200">
                                            <span className="text-xs">+</span>
                                        </Badge>
                                        {isLoading ? "Ajout..." : "Ajouter"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
