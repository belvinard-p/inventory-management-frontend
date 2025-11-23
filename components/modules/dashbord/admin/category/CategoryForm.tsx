"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { CategoryResponse, CategoryRequest } from "@/types/category"
import { useCompanies } from "@/hooks/useCompany"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/service/categoryService'
import { CategoriesCacheKeys } from '@/lib/const'
import { toast } from 'sonner'
import { enhancedToast } from '@/lib/toast-utils'

const categoryFormSchema = z.object({
  designation: z.string().min(2, {
    message: "Designation must be at least 2 characters.",
  }),
  code: z.string().regex(/^(CAT-\d{3}|CAT[A-Z]{3})$/, {
    message: "Code must be in the format CAT-123 or CATEFT",
  }),
  companyId: z.number().int().positive({
    message: "Company ID must be a positive number.",
  })
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  category?: CategoryResponse
}

export function CategoryForm({ open, onOpenChange, mode, category }: CategoryFormProps) {
  const { companies } = useCompanies(0, 100)
  const companiesData = Array.isArray(companies?.content) ? companies.content : []
  const queryClient = useQueryClient()
  
  // State for combobox
  const [openCombobox, setOpenCombobox] = useState(false)

  const createCategory = useMutation({
    mutationFn: (data: CategoryRequest) => categoryService.create(data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      enhancedToast.success("Catégorie créée avec succès", {
        description: `${newCategory.designation} a été ajoutée à votre liste`
      })
    },
    onError: (error: unknown) => {
      let status: number | undefined
      let conflictMessage: string | undefined
      let errMessage: string | undefined
      if (typeof error === 'object' && error !== null) {
        const withDetails = error as { details?: { status?: number; message?: string }; message?: string }
        status = withDetails.details?.status
        conflictMessage = withDetails.details?.message
        errMessage = withDetails.message
      }
      if (status === 409 || (errMessage && errMessage.includes('409'))) {
        toast.error("Conflit", { description: conflictMessage || "Une catégorie avec ce code existe déjà" })
        return
      }
      const message = conflictMessage || errMessage || "Erreur lors de la création de la catégorie"
      toast.error("Erreur de création", { description: message })
    }
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryRequest }) => 
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CategoriesCacheKeys.Categories] })
      toast.success("Catégorie mise à jour avec succès")
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour")
    }
  })
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      designation: category?.designation || "",
      code: category?.code || "",
      companyId: category?.companyId || 0,
    },
  })

  React.useEffect(() => {
    if (category && mode === "edit") {
      form.reset({
        designation: category.designation,
        code: category.code,
        companyId: category.companyId,
      })
    } else if (mode === "create") {
      form.reset({
        designation: "",
        code: "",
        companyId: 0,
      })
    }
  }, [category, mode, form])

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (mode === "create") {
        await createCategory.mutateAsync(values)
      } else if (category) {
        await updateCategory.mutateAsync({ id: category.id, data: values })
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer une catégorie" : "Modifier la catégorie"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Ajoutez une nouvelle catégorie à votre système."
              : "Modifiez les informations de cette catégorie."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Désignation</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la catégorie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Code de la catégorie (ex: CAT-123 ou CATEFT)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Format requis: CAT-123 (3 chiffres) ou CATEFT (3 lettres majuscules)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => {
                const selectedCompany = companiesData.find((c) => c.id === field.value)
                return (
                  <FormItem className="group flex flex-col">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">
                      Entreprise
                    </FormLabel>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isSubmitting}
                            className={cn(
                              "h-10 w-full justify-between bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60",
                              form.formState.errors.companyId && form.formState.touchedFields.companyId
                                ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                                : field.value > 0 && !form.formState.errors.companyId
                                ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                                : "border-border/40 focus:border-primary/60 focus:bg-background",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedCompany
                              ? selectedCompany.name
                              : "Rechercher une entreprise..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[99999]" align="start">
                        <Command>
                          <CommandInput placeholder="Rechercher une entreprise..." />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
                            <CommandGroup>
                              {companiesData.map((company) => (
                                <CommandItem
                                  key={company.id}
                                  value={company.name}
                                  onSelect={() => {
                                    field.onChange(company.id)
                                    setOpenCombobox(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      company.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {company.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Choisissez l&apos;entreprise pour cette catégorie.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Enregistrement..." 
                  : mode === "create" 
                    ? "Créer" 
                    : "Modifier"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}