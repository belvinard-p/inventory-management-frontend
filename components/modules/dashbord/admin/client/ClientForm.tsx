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
import { Check, X, User } from "lucide-react"
import { useClients } from "@/hooks/client/useClient"
import { ClientResponse, ClientRequest } from "@/types/client/client"

const clientSchema = z.object({
  name: z.string()
    .min(4, "Le nom doit contenir au moins 4 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .email("L'email doit être valide")
    .min(1, "L'email est requis"),
  phoneNumber: z.string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(
      /^(?:(?:\+237|237)[-.\s]?)?(?:[67][25-9]\d{7}|2\d{2}\d{6})$/,
      "Le numéro de téléphone doit être un numéro camerounais valide (mobile ou fixe). Exemples: 671234567, 222123456, +237-233123456"
    ),
  address: z.object({
    address1: z.string().max(100).optional().or(z.literal("")),
    address2: z.string().max(100).optional().or(z.literal("")),
    city: z.string().max(50).optional().or(z.literal("")),
    postalCode: z.string().max(10).optional().or(z.literal("")),
    country: z.string().max(50).optional().or(z.literal("")),
  }).optional(),
}).refine(
  (data) => {
    // If address is provided, validate required fields
    if (data.address) {
      // If any address field is filled, address1 and city become required
      const hasAnyAddressField = data.address.address1 || data.address.address2 || data.address.city || data.address.postalCode || data.address.country
      if (hasAnyAddressField) {
        if (data.address.address1 && data.address.address1.length < 5) {
          return false
        }
        if (data.address.city && data.address.city.length < 4) {
          return false
        }
        if (data.address.postalCode && data.address.postalCode.length < 3) {
          return false
        }
        if (data.address.country && data.address.country.length < 2) {
          return false
        }
      }
    }
    return true
  },
  {
    message: "Les champs d'adresse doivent respecter les longueurs minimales",
    path: ["address"],
  }
)

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: ClientResponse | null
  mode?: 'create' | 'edit'
}

export function ClientForm({ open, onOpenChange, client, mode = 'create' }: ClientFormProps) {
  const { createClient, createClientAsync, updateClient, isCreating, isUpdating } = useClients()
  const isEditMode = mode === 'edit' && client
  
  console.log('ClientForm rendered, open:', open, 'mode:', mode, 'client:', client)
  
  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: {
        address1: "",
        address2: "",
        city: "",
        postalCode: "",
        country: "",
      },
    },
  })

  // Réinitialiser le formulaire avec les données du client quand le dialog s'ouvre ou que le client change
  useEffect(() => {
    if (open) {
      if (isEditMode && client) {
        form.reset({
          name: client.name || "",
          email: client.email || "",
          phoneNumber: client.phoneNumber || "",
          address: client.address ? {
            address1: client.address.address1 || "",
            address2: client.address.address2 || "",
            city: client.address.city || "",
            postalCode: client.address.postalCode || "",
            country: client.address.country || "",
          } : {
            address1: "",
            address2: "",
            city: "",
            postalCode: "",
            country: "",
          },
        })
      } else {
        // Réinitialiser pour un nouveau formulaire
        form.reset({
          name: "",
          email: "",
          phoneNumber: "",
          address: {
            address1: "",
            address2: "",
            city: "",
            postalCode: "",
            country: "",
          },
        })
      }
    }
  }, [open, client, isEditMode, form])

  // Vérifier si tous les champs obligatoires sont remplis
  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = watchedValues.name && watchedValues.email && watchedValues.phoneNumber
  
  const isSubmitDisabled = !isFormValid || !hasRequiredFields || isCreating || isUpdating

  async function onSubmit(data: z.infer<typeof clientSchema>) {
    const requestData: ClientRequest = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address && (data.address.address1 || data.address.city) ? {
        address1: data.address.address1 || undefined,
        address2: data.address.address2 || undefined,
        city: data.address.city || undefined,
        postalCode: data.address.postalCode || undefined,
        country: data.address.country || undefined,
      } : undefined,
    }
    
    if (isEditMode) {
      updateClient({
        id: client.id,
        data: requestData
      })
      // Form will close on success via mutation onSuccess callback
      form.reset()
      onOpenChange(false)
    } else {
      // Use async version and only close on success
      // apiClient handles errors automatically via toast, so we catch to prevent unhandled rejection
      // but don't show error since apiClient already did
      try {
        const result = await createClientAsync(requestData)
        if (result) {
          form.reset()
          onOpenChange(false)
        }
      } catch {
        // Error already handled by apiClient via toast, form stays open
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditMode ? "Modifier le client" : 'Créer un client'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifiez les informations du client." 
              : 'Ajoutez un nouveau client au système.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Nom</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Nom du client"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.name && form.formState.touchedFields.name
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
                name="email"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.email && form.formState.touchedFields.email
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.email && form.formState.touchedFields.email
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && form.formState.touchedFields.email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.email ? (
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
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Numéro de téléphone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="671234567"
                        {...field}
                        disabled={isCreating || isUpdating}
                        className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                          form.formState.errors.phoneNumber && form.formState.touchedFields.phoneNumber
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

            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full" />
                <h3 className="text-sm font-medium text-foreground/80">Adresse (optionnel)</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.address1"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Adresse ligne 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Rue Example"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.address2"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Adresse ligne 2</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Appartement, suite, etc."
                          {...field}
                          disabled={isCreating || isUpdating}
                          className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Ville</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Yaoundé"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Code postal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem className="group sm:col-span-2">
                      <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Pays</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cameroun"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating || isUpdating} className="relative">
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
                    {isUpdating ? "Modification..." : "Modifier le client"}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-100 text-green-800 border-green-200">
                      <span className="text-xs">+</span>
                    </Badge>
                    {isCreating ? "Création..." : "Créer le client"}
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

