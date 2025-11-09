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
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Package } from "lucide-react"
import { ClientOrderResponse, ClientOrderRequest } from "@/types/client/clientOrder"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { clientService } from "@/service/client/clientService"
import { useCreateCmdClient, useUpdateCmdClient } from "@/hooks/commandes/cmdClient/useCmdClient"

const orderSchema = z.object({
  code: z.string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(50, "Le code ne peut pas dépasser 50 caractères")
    .regex(
      /^ORD-\d{3}$|^ORD[A-Z]{3}$/,
      "Le code doit être au format ORD-XXX (ex: ORD-123) ou ORDABC"
    ),
  orderDate: z.string()
    .min(1, "La date de commande est requise")
    .transform((val) => {
      // Ensure the date is in YYYY-MM-DD format
      if (val.includes('/')) {
        const date = new Date(val)
        return date.toISOString().split('T')[0]
      }
      return val
    }),
  clientId: z.number().min(1, "Veuillez sélectionner un client"),
  comments: z.string()
    .max(500, "Les commentaires ne peuvent pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
})

interface CmdClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: ClientOrderResponse | null
  mode?: 'create' | 'edit'
}

export function CmdClientForm({ 
  open, 
  onOpenChange, 
  order, 
  mode = 'create'
}: CmdClientFormProps) {
  const isEditMode = mode === 'edit' && order
  
  const createMutation = useCreateCmdClient()
  const updateMutation = useUpdateCmdClient()
  
  const isLoading = createMutation.isPending || updateMutation.isPending
  
  // Fetch clients for the select dropdown
  const { data: clientsResponse } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAll({ page: 0, size: 1000 }),
    enabled: open,
  })
  
  const clients = clientsResponse?.content || []
  
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      orderDate: new Date().toISOString().split('T')[0],
      clientId: 0,
      comments: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (isEditMode && order) {
        form.reset({
          code: order.code || "",
          orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : "",
          clientId: order.clientId || 0,
          comments: order.comments || "",
        })
      } else {
        form.reset({
          code: "",
          orderDate: new Date().toISOString().split('T')[0],
          clientId: 0,
          comments: "",
        })
      }
    }
  }, [open, order, isEditMode, form])

  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = watchedValues.code && watchedValues.orderDate && watchedValues.clientId > 0
  
  const isSubmitDisabled = !isFormValid || !hasRequiredFields || isLoading

  async function handleSubmit(data: z.infer<typeof orderSchema>) {
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = data.orderDate
    if (formattedDate.includes('/')) {
      const date = new Date(formattedDate)
      formattedDate = date.toISOString().split('T')[0]
    }

    const orderData: ClientOrderRequest = {
      code: data.code,
      orderDate: formattedDate,
      clientId: data.clientId,
      comments: data.comments || undefined,
      stateOrder: isEditMode && order ? order.stateOrder : "pending",
    }

    console.log('Sending order data:', orderData) // Debug log

    try {
      if (isEditMode && order) {
        await updateMutation.mutateAsync({ id: order.id, data: orderData })
      } else {
        await createMutation.mutateAsync(orderData)
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation hooks
      console.error('Error creating/updating order:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-visible z-[9999]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditMode ? "Modifier la commande" : 'Créer une commande'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifiez les informations de la commande." 
              : 'Ajoutez une nouvelle commande client au système.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                      Code de commande
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="ORD-123 ou ORDABC"
                          {...field}
                          disabled={isLoading}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.code && form.formState.touchedFields.code
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.code && form.formState.touchedFields.code
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && form.formState.touchedFields.code && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.code ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {!form.formState.errors.code && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: ORD-123 (3 chiffres) ou ORDABC (3 lettres majuscules)
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                      Date de commande
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          disabled={isLoading}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.orderDate && form.formState.touchedFields.orderDate
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.orderDate && form.formState.touchedFields.orderDate
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && form.formState.touchedFields.orderDate && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.orderDate ? (
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
            </div>

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                    Client
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value > 0 ? field.value.toString() : ""}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className={`h-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                        form.formState.errors.clientId && form.formState.touchedFields.clientId
                          ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                          : field.value > 0 && !form.formState.errors.clientId
                          ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                          : "border-border/40 focus:border-primary/60 focus:bg-background"
                      }`}>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent 
                      position="popper" 
                      sideOffset={5} 
                      className="max-h-[300px] z-[99999]"
                      align="start"
                      avoidCollisions={false}
                    >
                      {clients.map((client: { id: number; name: string; email: string }) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                    Commentaires (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajouter des commentaires sur cette commande..."
                      {...field}
                      value={field.value || ""}
                      disabled={isLoading}
                      className="min-h-[100px] bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                    />
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
                    {isLoading ? "Modification..." : "Modifier la commande"}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-100 text-green-800 border-green-200">
                      <span className="text-xs">+</span>
                    </Badge>
                    {isLoading ? "Création..." : "Créer la commande"}
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
