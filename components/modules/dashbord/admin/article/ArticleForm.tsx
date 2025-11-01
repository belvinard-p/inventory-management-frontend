"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Package } from "lucide-react"
import { useArticles } from "@/hooks/article/useArticle"
import { useCategories } from "@/hooks/category/useCategory"
import { ArticleResponse, ArticleRequest } from "@/types/article"

const articleSchema = z.object({
  codeArticle: z.string().min(2, "Le code doit contenir au moins 2 caractères").max(50, "Le code ne peut pas dépasser 50 caractères"),
  designation: z.string().min(3, "La désignation doit contenir au moins 3 caractères").max(100, "La désignation ne peut pas dépasser 100 caractères"),
  quantityInStock: z.number().min(0, "La quantité doit être positive").optional(),
  unitPriceExclTax: z.number().min(0, "Le prix doit être positif"),
  rateTva: z.number().min(0, "Le taux TVA doit être positif").max(100, "Le taux TVA ne peut pas dépasser 100%"),
  categoryId: z.number().min(1, "Veuillez sélectionner une catégorie"),
  imageFile: z.instanceof(File).optional(),
})

interface ArticleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article?: ArticleResponse | null
  mode?: 'create' | 'edit'
}

export function ArticleForm({ open, onOpenChange, article, mode = 'create' }: ArticleFormProps) {
  const { createArticle, createArticleAsync, updateArticle, updateArticleImage, isCreating, isUpdating, isUpdatingImage } = useArticles()
  const { categories } = useCategories()
  const isEditMode = mode === 'edit' && article
  
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    mode: "onChange",
    defaultValues: {
      codeArticle: article?.codeArticle || "",
      designation: article?.designation || "",
      quantityInStock: article?.quantityInStock || 0,
      unitPriceExclTax: article?.unitPriceExclTax || 0,
      rateTva: article?.rateTva || 0,
      categoryId: article?.categoryId || 0,
    },
  })

  const watchedValues = form.watch()
  const isFormValid = form.formState.isValid
  const hasRequiredFields = watchedValues.codeArticle && watchedValues.designation && 
                           watchedValues.unitPriceExclTax && watchedValues.categoryId
  
  const isSubmitDisabled = !isFormValid || !hasRequiredFields || isCreating || isUpdating || isUpdatingImage

  async function onSubmit(data: z.infer<typeof articleSchema>) {
    const { imageFile, ...articleData } = data
    
    const requestData: ArticleRequest = {
      ...articleData,
      quantityInStock: articleData.quantityInStock || 0,
    }
    
    if (isEditMode) {
      updateArticle({
        id: article.id,
        data: requestData
      })
      
      if (imageFile) {
        updateArticleImage({ id: article.id, imageFile })
      }
    } else {
      try {
        const result = await createArticleAsync(requestData)
        
        if (result && imageFile) {
          updateArticleImage({ id: result.id, imageFile })
        }
      } catch (error) {
        console.error('Error creating article:', error)
        return
      }
    }
    
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditMode ? "Modifier l'article" : 'Créer un article'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifiez les informations de l'article." 
              : 'Ajoutez un nouvel article au système.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codeArticle"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Code Article</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="ART001"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.codeArticle 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.codeArticle 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.codeArticle ? (
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
                name="designation"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Désignation</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Nom de l'article"
                          {...field}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.designation 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.designation 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.designation ? (
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantityInStock"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Quantité en stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                name="unitPriceExclTax"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Prix unitaire HT</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.unitPriceExclTax 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.unitPriceExclTax 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.unitPriceExclTax ? (
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
                name="rateTva"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Taux TVA (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="19.25"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isCreating || isUpdating}
                          className={`h-10 pl-4 pr-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                            form.formState.errors.rateTva 
                              ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                              : field.value && !form.formState.errors.rateTva 
                              ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                              : "border-border/40 focus:border-primary/60 focus:bg-background"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {form.formState.errors.rateTva ? (
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
              name="categoryId"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Catégorie</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className={`h-10 bg-background/50 border-2 transition-all duration-300 rounded-lg hover:border-border/60 ${
                        form.formState.errors.categoryId 
                          ? "border-red-400 focus:border-red-500 bg-red-50/50" 
                          : field.value && !form.formState.errors.categoryId 
                          ? "border-green-400 focus:border-green-500 bg-green-50/50" 
                          : "border-border/40 focus:border-primary/60 focus:bg-background"
                      }`}>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.content?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full" />
                <h3 className="text-sm font-medium text-foreground/80">Image (optionnel)</h3>
              </div>
              
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem className="group">
                    <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Fichier Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          onChange(file)
                        }}
                        disabled={isCreating || isUpdating || isUpdatingImage}
                        className="h-10 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-lg hover:border-border/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating || isUpdating || isUpdatingImage} className="relative">
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
                    {isUpdating || isUpdatingImage ? "Modification..." : "Modifier l'article"}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-100 text-green-800 border-green-200">
                      <span className="text-xs">+</span>
                    </Badge>
                    {isCreating || isUpdatingImage ? "Création..." : "Créer l'article"}
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