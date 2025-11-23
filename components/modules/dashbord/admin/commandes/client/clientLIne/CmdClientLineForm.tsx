"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
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
import { Check, X, Package, ChevronsUpDown, ShoppingCart, FileText } from "lucide-react"
import { OrderClientLineResponse, OrderClientLineRequest } from "@/types/client/orderClientLine"
import { useQuery } from "@tanstack/react-query"
import { articleService } from "@/service/articleService"
import { clientOrderService } from "@/service/client/clientOrderService"
import { useOrderClientLines } from "@/hooks/commandes/cmdClient/useOrderClientLine"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const lineSchema = z.object({
    articleId: z.number().min(1, "Veuillez sélectionner un article"),
    quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
    clientOrderId: z.number().optional(),
})

type LineFormValues = z.infer<typeof lineSchema>

interface CmdClientLineFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clientOrderId?: number
    line?: OrderClientLineResponse | null
}

export function CmdClientLineForm({
    open,
    onOpenChange,
    clientOrderId,
    line
}: CmdClientLineFormProps) {
    const isEditMode = !!line

    const { createOrderClientLineAsync, updateOrderClientLine, isCreating, isUpdating } = useOrderClientLines()

    const isLoading = isCreating || isUpdating

    // State for comboboxes
    const [openCombobox, setOpenCombobox] = useState(false)
    const [openOrderCombobox, setOpenOrderCombobox] = useState(false)

    // Fetch articles for the combobox
    const { data: articlesResponse } = useQuery({
        queryKey: ["articles"],
        queryFn: () => articleService.getAll({ page: 0, size: 1000 }),
        enabled: open,
    })

    // Fetch orders if clientOrderId is not provided
    const { data: ordersResponse } = useQuery({
        queryKey: ["allOrders"],
        queryFn: () => clientOrderService.getAllOrders(),
        enabled: open && !isEditMode && !clientOrderId,
    })

    // Fetch clients to get client names
    const { data: clientsResponse } = useQuery({
        queryKey: ["clients"],
        queryFn: () => import("@/service/client/clientService").then(m => m.clientService.getAll({ page: 0, size: 1000 })),
        enabled: open && !isEditMode && !clientOrderId,
    })

    const articles = articlesResponse?.content || []
    const orders = ordersResponse || []
    const clients = clientsResponse?.content || []

    // Enrichir les commandes avec les noms des clients
    const ordersWithClientNames = orders.map(order => {
        const client = clients.find(c => c.id === order.clientId)
        return {
            ...order,
            clientName: client?.name || 'Client non trouvé'
        }
    })

    const form = useForm<LineFormValues>({
        resolver: zodResolver(lineSchema),
        mode: "onChange",
        defaultValues: {
            articleId: 0,
            quantity: 1,
            clientOrderId: clientOrderId || 0,
        },
    })

    useEffect(() => {
        if (open) {
            if (isEditMode && line) {
                form.reset({
                    articleId: line.articleId,
                    quantity: line.quantity,
                    clientOrderId: line.clientOrderId,
                })
            } else {
                form.reset({
                    articleId: 0,
                    quantity: 1,
                    clientOrderId: clientOrderId || 0,
                })
            }
        }
    }, [open, line, isEditMode, form, clientOrderId])

    const watchedValues = form.watch()
    const isFormValid = form.formState.isValid
    
    // En mode édition, on vérifie seulement la quantité
    // En mode création, on vérifie tous les champs requis
    const hasRequiredFields = isEditMode 
        ? watchedValues.quantity > 0
        : watchedValues.articleId > 0 && watchedValues.quantity > 0 && (!!clientOrderId || (watchedValues.clientOrderId !== undefined && watchedValues.clientOrderId > 0))

    const isSubmitDisabled = !hasRequiredFields || isLoading

    async function handleSubmit(data: LineFormValues) {
        try {
            if (isEditMode && line) {
                // En mode édition, on peut maintenant modifier l'article aussi
                const requestData: OrderClientLineRequest = {
                    clientOrderId: line.clientOrderId,
                    articleId: data.articleId,
                    quantity: data.quantity,
                }
                // Vous devrez créer une méthode updateOrderClientLineFull dans votre service
                // Pour l'instant, on ne met à jour que la quantité
                await updateOrderClientLine({ id: line.id, quantity: data.quantity })
                onOpenChange(false)
            } else {
                const targetOrderId = clientOrderId || data.clientOrderId

                if (!targetOrderId) {
                    console.error("Client Order ID is missing")
                    return
                }

                const requestData: OrderClientLineRequest = {
                    clientOrderId: targetOrderId,
                    articleId: data.articleId,
                    quantity: data.quantity,
                }
                await createOrderClientLineAsync(requestData)
                form.reset()
                onOpenChange(false)
            }
        } catch (error) {
            console.error('Error creating/updating line:', error)
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
                        <ShoppingCart className="h-5 w-5" />
                        {isEditMode ? "Modifier la ligne" : 'Ajouter une ligne de commande'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Modifiez la quantité de l'article."
                            : 'Ajoutez un nouvel article à une commande.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        {!clientOrderId && !isEditMode && (
                            <FormField
                                control={form.control}
                                name="clientOrderId"
                                render={({ field }) => {
                                    const selectedOrder = ordersWithClientNames.find(o => o.id === field.value)

                                    return (
                                        <FormItem className="group flex flex-col">
                                            <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                                                Commande Client
                                            </FormLabel>
                                            <Popover open={openOrderCombobox} onOpenChange={setOpenOrderCombobox}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            disabled={isLoading}
                                                            className={cn(
                                                                "h-10 w-full justify-between bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <span className="truncate">
                                                                {selectedOrder
                                                                    ? `Commande #${selectedOrder.code} - ${selectedOrder.clientName || 'Client non défini'}`
                                                                    : "Sélectionner une commande..."}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[99999]" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Rechercher une commande..." />
                                                        <CommandList>
                                                            <CommandEmpty>Aucune commande trouvée.</CommandEmpty>
                                                            <CommandGroup>
                                                                {ordersWithClientNames.map((order) => (
                                                                    <CommandItem
                                                                        key={order.id}
                                                                        value={`${order.code} ${order.clientName || ''}`}
                                                                        onSelect={() => {
                                                                            field.onChange(order.id)
                                                                            setOpenOrderCombobox(false)
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                order.id === field.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        #{order.code} - {order.clientName || 'Client non défini'}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="articleId"
                            render={({ field }) => {
                                const selectedArticle = articles.find((a: { id: number }) => a.id === field.value)
                                const displayText = isEditMode && line
                                    ? `${line.articleCode} - ${line.articleDesignation}`
                                    : selectedArticle
                                        ? `${selectedArticle.codeArticle} - ${selectedArticle.designation}`
                                        : "Rechercher un article..."

                                return (
                                    <FormItem className="group flex flex-col">
                                        <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                                            Article
                                        </FormLabel>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        disabled={isLoading}
                                                        className={cn(
                                                            "h-10 w-full justify-between bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60",
                                                            form.formState.errors.articleId && form.formState.touchedFields.articleId
                                                                ? "border-red-400 focus:border-red-500 bg-red-50/50"
                                                                : field.value > 0 && !form.formState.errors.articleId
                                                                    ? "border-green-400 focus:border-green-500 bg-green-50/50"
                                                                    : "border-border/40 focus:border-primary/60 focus:bg-background",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate">{displayText}</span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[99999]" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Rechercher un article..." />
                                                    <CommandList>
                                                        <CommandEmpty>Aucun article trouvé.</CommandEmpty>
                                                        <CommandGroup>
                                                            {articles.map((article: { id: number; codeArticle: string; designation: string }) => (
                                                                <CommandItem
                                                                    key={article.id}
                                                                    value={`${article.codeArticle} ${article.designation}`}
                                                                    onSelect={() => {
                                                                        field.onChange(article.id)
                                                                        setOpenCombobox(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            article.id === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {article.codeArticle} - {article.designation}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                                        Quantité
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={e => field.onChange(e.target.valueAsNumber)}
                                                value={isNaN(field.value) ? '' : field.value}
                                                disabled={isLoading}
                                                className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${form.formState.errors.quantity && form.formState.touchedFields.quantity
                                                    ? "border-red-400 focus:border-red-500 bg-red-50/50"
                                                    : field.value && !form.formState.errors.quantity && form.formState.touchedFields.quantity
                                                        ? "border-green-400 focus:border-green-500 bg-green-50/50"
                                                        : "border-border/40 focus:border-primary/60 focus:bg-background"
                                                    }`}
                                            />
                                            {field.value && form.formState.touchedFields.quantity && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {form.formState.errors.quantity ? (
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
