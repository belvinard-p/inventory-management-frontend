"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
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

import { Eye, EyeOff, Check, X } from "lucide-react"
import { useUsersAdmin } from "@/hooks/user"

import { User } from "@/types"

const createUserSchema = z.object({
  firstName: z.string().min(3, "Le prénom doit contenir au moins 3 caractères").max(20, "Le prénom ne peut pas dépasser 20 caractères"),
  lastName: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(20, "Le nom ne peut pas dépasser 20 caractères"),
  userName: z.string().min(4, "Le nom d&apos;utilisateur doit contenir au moins 4 caractères").max(10, "Le nom d&apos;utilisateur ne peut pas dépasser 10 caractères"),
  email: z.string().email("Email invalide").max(50, "L&apos;email ne peut pas dépasser 50 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(40, "Le mot de passe ne peut pas dépasser 40 caractères"),
  image: z.string().url("URL invalide").optional().or(z.literal("")),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

const editUserSchema = z.object({
  firstName: z.string().min(3, "Le prénom doit contenir au moins 3 caractères").max(20, "Le prénom ne peut pas dépasser 20 caractères"),
  lastName: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(20, "Le nom ne peut pas dépasser 20 caractères"),
  userName: z.string().min(4, "Le nom d&apos;utilisateur doit contenir au moins 4 caractères").max(10, "Le nom d&apos;utilisateur ne peut pas dépasser 10 caractères"),
  email: z.string().email("Email invalide").max(50, "L&apos;email ne peut pas dépasser 50 caractères"),
  password: z.string().optional(),
  image: z.string().url("URL invalide").optional().or(z.literal("")),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  mode?: 'create' | 'edit'
}

export function UserForm({ open, onOpenChange, user, mode = 'create' }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { createUser, updateUser, isCreating, isUpdating } = useUsersAdmin()
  const isEditMode = mode === 'edit' && user
  
  const schema = isEditMode ? editUserSchema : createUserSchema
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      userName: user?.userName || "",
      email: user?.email || "",
      password: "",
      image: user?.image || "",
      address1: user?.address?.address1 || "",
      address2: user?.address?.address2 || "",
      city: user?.address?.city || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
    },
  })

  // Vérifier si tous les champs obligatoires sont remplis
  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = isEditMode 
    ? watchedValues.firstName && watchedValues.lastName && watchedValues.userName && watchedValues.email
    : watchedValues.firstName && watchedValues.lastName && watchedValues.userName && watchedValues.email && watchedValues.password
  
  const isSubmitDisabled = !isFormValid || !hasRequiredFields || isCreating || isUpdating

  async function onSubmit(data: z.infer<typeof schema>) {
    console.log('Form data submitted:', data)
    const { address1, address2, city, postalCode, country, password, ...baseData } = data
    
    // For edit: address is required, for create: address is optional
    const hasAddressData = address1 || address2 || city || postalCode || country
    const address = hasAddressData ? {
      address1: address1 || "",
      address2: address2 || "",
      city: city || "",
      postalCode: postalCode || "",
      country: country || "",
    } : undefined
    
    if (isEditMode) {
      const updateData = {
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        userName: baseData.userName,
        email: baseData.email,
        ...(address && { address })
      }
      console.log('Update data being sent:', updateData)
      updateUser({
        id: user.userId,
        data: updateData
      })
    } else {
      const createData = {
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        userName: baseData.userName,
        email: baseData.email,
        password: password || "",
        ...(baseData.image && { image: baseData.image }),
        ...(address && { address }),
        signUpMethod: "email"
      }
      console.log('Create data being sent:', createData)
      createUser(createData)
    }
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? "Modifier l'utilisateur" 
                : 'Créer un utilisateur'
              }
            </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifiez les informations de l'utilisateur." 
              : 'Ajoutez un nouvel utilisateur au système.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Prénom</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Patrick"
                          {...field}
                          disabled={isCreating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.firstName 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.firstName 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.firstName ? (
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
                name="lastName"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Nom</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Djoumessi"
                          {...field}
                          disabled={isCreating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.lastName 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.lastName 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.lastName ? (
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
              name="userName"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Nom d&apos;utilisateur</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="pdjoumessi"
                        {...field}
                        disabled={isCreating}
                        className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                          form.formState.errors.userName 
                            ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                            : field.value && !form.formState.errors.userName 
                            ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                            : "border-border/40 focus:border-primary/60 focus:bg-background"
                        }`}
                      />
                      {field.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {form.formState.errors.userName ? (
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
                        placeholder="patrick.djoumessi@gmail.com"
                        {...field}
                        disabled={isCreating}
                        className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                          form.formState.errors.email 
                            ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                            : field.value && !form.formState.errors.email 
                            ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                            : "border-border/40 focus:border-primary/60 focus:bg-background"
                        }`}
                      />
                      {field.value && (
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
            
            {!isEditMode && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isCreating}
                          className={`h-10 pl-4 pr-20 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.password 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.password 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-12 top-1/2 -translate-y-1/2">
                            {form.formState.errors.password ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isCreating}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Photo de profil (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      {...field}
                      disabled={isCreating}
                      className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                    />
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
              
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse 1</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Avenue Charles Atangana"
                        {...field}
                        disabled={isCreating}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse 2</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Quartier Mvog-Ada"
                        {...field}
                        disabled={isCreating}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Yaoundé"
                          {...field}
                          disabled={isCreating}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="23703"
                          {...field}
                          disabled={isCreating}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cameroon"
                        {...field}
                        disabled={isCreating}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    {isUpdating ? "Modification..." : "Modifier l'utilisateur"}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-100 text-green-800 border-green-200">
                      <span className="text-xs">+</span>
                    </Badge>
                    {isCreating ? "Création..." : "Créer l'utilisateur"}
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