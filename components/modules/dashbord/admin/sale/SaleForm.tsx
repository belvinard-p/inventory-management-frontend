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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Receipt } from "lucide-react"
import { useCreateSale, useUpdateSale } from "@/hooks/useSales"
import { Sale, SaleRequest, SaleStatus } from "@/types/sale"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"

const saleSchema = z.object({
  comments: z.string().max(50, "Les commentaires ne peuvent pas dépasser 50 caractères").optional().or(z.literal("")),
  saleDate: z.string().min(1, "La date de vente est obligatoire"),
  status: z.nativeEnum(SaleStatus, { message: "Le statut est obligatoire" }),
  clientId: z.number({ message: "Le client est obligatoire" }).min(1, "Veuillez sélectionner un client"),
  clientOrderId: z.number({ message: "La commande client est obligatoire" }).min(1, "Veuillez sélectionner une commande"),
})

interface SaleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale?: Sale | null
  mode?: 'create' | 'edit'
}

export function SaleForm({ open, onOpenChange, sale, mode = 'create' }: SaleFormProps) {
  const isEditMode = mode === 'edit' && sale
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const createMutation = useCreateSale()
  const updateMutation = useUpdateSale()

  // Récupérer les clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-sales'],
    queryFn: () => apiClient.get('/clients/all?pageSize=100'),
    select: (data: any) => data.content || []
  })

  // Récupérer les commandes du client sélectionné
  const { data: clientOrders = [] } = useQuery({
    queryKey: ['client-orders', selectedClientId],
    queryFn: () => apiClient.get(`/client-orders/client/${selectedClientId}`),
    enabled: !!selectedClientId,
    select: (data: any) => Array.isArray(data) ? data : []
  })

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    mode: "onChange",
    defaultValues: {
      comments: "",
      saleDate: new Date().toISOString().split('T')[0],
      status: SaleStatus.DRAFT,
      clientId: undefined as any,
      clientOrderId: undefined as any,
    },
  })

  useEffect(() => {
    if (open) {
      if (isEditMode && sale) {
        form.reset({
          comments: sale.comments || "",
          saleDate: sale.saleDate.split('T')[0],
          status: sale.status,
          clientId: undefined as any, // Will be set from clientName lookup
          clientOrderId: sale.clientOrderId,
        })
        setSelectedClientId(null) // Will be set from clientName lookup
      } else {
        form.reset({
          comments: "",
          saleDate: new Date().toISOString().split('T')[0],
          status: SaleStatus.DRAFT,
          clientId: undefined as any,
          clientOrderId: undefined as any,
        })
        setSelectedClientId(null)
      }
    }
  }, [open, sale, isEditMode, form])

  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = watchedValues.clientId > 0 && watchedValues.clientOrderId > 0 && watchedValues.saleDate

  const isSubmitDisabled = !isFormValid || !hasRequiredFields || createMutation.isPending || updateMutation.isPending

  function onSubmit(data: z.infer<typeof saleSchema>) {
    const requestData: SaleRequest = {
      comments: data.comments || undefined,
      saleDate: data.saleDate,
      status: data.status,
      clientId: data.clientId,
      clientOrderId: data.clientOrderId,
    }

    if (isEditMode) {
      updateMutation.mutate({ id: sale.id, data: requestData }, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        }
      })
    } else {
      createMutation.mutate(requestData, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-visible z-[9999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {isEditMode ? "Modifier la vente" : 'Créer une vente'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifiez les informations de la vente."
              : 'Ajoutez une nouvelle vente au système.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de vente</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={createMutation.isPending || updateMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SaleStatus.DRAFT}>Brouillon</SelectItem>
                        <SelectItem value={SaleStatus.CONFIRMED}>Confirmée</SelectItem>
                        <SelectItem value={SaleStatus.CANCELLED}>Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const clientId = parseInt(value)
                      field.onChange(clientId)
                      setSelectedClientId(clientId)
                      form.setValue('clientOrderId', undefined as any) // Reset order selection
                    }}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
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
              name="clientOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commande client</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : undefined}
                    disabled={!selectedClientId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une commande" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientOrders.map((order: any) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          {order.code} - {order.stateOrder}
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
                <FormItem>
                  <FormLabel>Commentaires (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Commentaires sur la vente..."
                      {...field}
                      disabled={createMutation.isPending || updateMutation.isPending}
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {isEditMode ? (
                  updateMutation.isPending ? "Modification..." : "Modifier la vente"
                ) : (
                  createMutation.isPending ? "Création..." : "Créer la vente"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}