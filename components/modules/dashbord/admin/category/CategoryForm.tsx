"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { CategoryResponse as Category } from "@/types/category"

const categoryFormSchema = z.object({
  designation: z.string().min(2, {
    message: "Designation must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Code must be at least 2 characters.",
  }),
  companyId: z.number().int().positive({
    message: "Company ID must be a positive number.",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  image: z.string().optional()
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  category?: Category
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export const CategoryForm = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      designation: category?.designation || "",
      code: category?.code || "",
      companyId: category?.companyId || 0,
      isActive: category?.isActive ?? true,
      description: category?.description || "",
      image: category?.image || "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      await onSubmit(values);
      toast.success(category ? "Category updated" : "Category created", {
        description: category
          ? "Your category has been updated successfully."
          : "Your category has been created successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while saving the category.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-8">
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" {...field} />
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
                  <Input placeholder="Category code (e.g., CAT001)" {...field} />
                </FormControl>
                <FormDescription>
                  A unique code for this category.
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
                <FormLabel>Company ID</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Company ID" 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
