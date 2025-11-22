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
import { Check, X, Package, ChevronsUpDown, Hash, ShoppingCart } from "lucide-react"
import { OrderClientLineResponse, OrderClientLineRequest } from "@/types/client/orderClientLine"
import { useQuery } from "@tanstack/react-query"
import { articleService } from "@/service/articleService"
import { clientOrderService } from "@/service/client/clientOrderService"
import { useOrderClientLines } from "@/hooks/commandes/cmdClient/useOrderClientLine"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const lineSchema = z.object({
  clientOrderId: z.number().min(1, "Veuillez sélectionner une commande").optional(),
  articleId: z.number().min(1, "Veuillez sélectionner un article"),
  quantity: z.number()
    .min(1, "La quantité doit être au moins 1")
    .max(10000, "La quantité ne peut pas dépasser 10000"),
}).refine((data) => {
  // If clientOrderId is not provided externally, it must be provided in the form
  return data.clientOrderId !== undefined
}, {
  message: "Veuillez sélectionner une commande",
  path: ["clientOrderId"]
})

interface CmdClientLineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  line?: OrderClientLineResponse | null
  mode?: 'create' | 'edit'
  clientOrderId?: number
}

export function CmdClientLineForm({ 
  open, 
  onOpenChange, 
  line, 
  mode = 'create',
  clientOrderId
}: CmdClientLineFormProps) {
  const isEditMode = mode === 'edit' && line
  
  const { createOrderClientLineAsync, updateOrderClientLine, isCreating, isUpdating } = useOrderClientLines()
  
  const isLoading = isCreating || isUpdating
  
  // State for combobox
  const [openCombobox, setOpenCombobox] = useState(false)
  const [openOrderCombobox, setOpenOrderCombobox] = useState(false)
  
  // Fetch articles for the combobox
  const { data: articlesResponse } = useQuery({
    queryKey: ["articles"],
    queryFn: () => articleService.getAll({ page: 0, size: 1000 }),
    enabled: open,
  })
  
  // Fetch orders for the combobox (only when clientOrderId is not provided)
  const { data: ordersResponse } = useQuery({
    queryKey: ["orders"],
    queryFn: () => clientOrderService.getAllOrders(),
    enabled: open && !clientOrderId,
  })
  
  const articles = articlesResponse?.content || []
  const orders = ordersResponse || []
  
  const needsOrderSelection = !clientOrderId && !isEditMode
  
  const form = useForm<z.infer<typeof lineSchema>>({
    resolver: zodResolver(lineSchema),
    mode: "onChange",
    defaultValues: {
      clientOrderId: clientOrderId || undefined,
      articleId: 0,
      quantity: 1,
    },
  })

  useEffect(() => {
    if (open) {
      if (isEditMode && line) {
        form.reset({
          clientOrderId: clientOrderId || line.clientOrderId,
          articleId: line.articleId || 0,
          quantity: line.quantity || 1,
        })
      } else {
        form.reset({
          clientOrderId: clientOrderId || undefined,
          articleId: 0,
          quantity: 1,
        })
      }
    }
  }, [open, line, isEditMode, form, clientOrderId])

  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = watchedValues.articleId > 0 && watchedValues.quantity > 0 && 
    (clientOrderId ? true : (watchedValues.clientOrderId ?? 0) > 0)
  
  const isSubmitDisabled = !isFormValid || !hasRequiredFields || isLoading

  async function handleSubmit(data: z.infer<typeof lineSchema>) {
    const finalClientOrderId = clientOrderId || data.clientOrderId!
    const lineData: OrderClientLineRequest = {
      clientOrderId: finalClientOrderId,
      articleId: data.articleId,
      quantity: data.quantity,
    }

    console.log('Sending line data:', lineData)

    try {
      if (isEditMode && line) {
        await updateOrderClientLine({ id: line.id, quantity: data.quantity })
      } else {
        await createOrderClientLineAsync(lineData)
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating/updating line:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-visible z-[9999]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditMode ? "Modifier la ligne" : 'Ajouter un article'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifiez la quantité de l'article." 
              : 'Ajoutez un article à la commande.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Order Selector - only show when clientOrderId is not provided */}
            {needsOrderSelection && (
              <FormField
                control={form.control}
                name="clientOrderId"
                render={({ field }) => {
                  const selectedOrder = orders.find((o) => o.id === field.value)
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
                                form.formState.errors.clientOrderId && form.formState.touchedFields.clientOrderId
                                  ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                                  : (field.value ?? 0) > 0 && !form.formState.errors.clientOrderId
                                  ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                                  : "border-border/40 focus:border-primary/60 focus:bg-background",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedOrder
                                ? `${selectedOrder.code} - ${selectedOrder.clientName}`
                                : "Sélectionner une commande..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[99999]" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une commande..." />
                            <CommandList>
                              <CommandEmpty>Aucune ligne de commande trouvée.</CommandEmpty>
                              <CommandGroup>
                                {orders.map((order) => (
                                  <CommandItem
                                    key={order.id}
                                    value={`${order.code} ${order.clientName || 'Client inconnu'}`}
                                    onSelect={() => {
                                      field.onChange(order.id)
                                      setOpenOrderCombobox(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        (field.value ?? 0) === order.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{order.code}</span>
                                      <span className="text-sm text-muted-foreground">{order.clientName || 'Client inconnu'}</span>
                                    </div>
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
                            disabled={isLoading || !!isEditMode}
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
                            {selectedArticle
                              ? `${selectedArticle.codeArticle} - ${selectedArticle.designation}`
                              : "Rechercher un article..."}
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
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={isLoading}
                        className={`h-10 pl-10 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                          form.formState.errors.quantity && form.formState.touchedFields.quantity
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
