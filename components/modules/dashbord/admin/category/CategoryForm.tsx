"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryResponse, CategoryRequest } from "@/types/category"
import { useCompanies } from "@/hooks/useCompany"
import { useCreateCategory, useUpdateCategory } from '@/hooks/category/useCategory'

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
  
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  
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

  const handleSubmit = (values: CategoryFormValues) => {
    if (mode === "create") {
      createMutation.mutate(values, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        }
      })
    } else if (category) {
      updateMutation.mutate({ id: category.id, data: values }, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        }
      })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une entreprise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto" position="popper" sideOffset={4}>
                      {companiesData.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choisissez l&apos;entreprise pour cette catégorie.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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