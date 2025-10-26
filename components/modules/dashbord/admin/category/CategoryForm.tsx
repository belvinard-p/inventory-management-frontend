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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CategoryResponse as Category } from "@/types/category"
import { useCompanies } from "@/hooks/useCompany"

const categoryFormSchema = z.object({
  designation: z.string().min(2, {
    message: "Designation must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Code must be at least 2 characters.",
  }),
  companyId: z.number().int().positive({
    message: "Company ID must be a positive number.",
  })
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
  const { companies } = useCompanies(0, 100) // Get all companies
  const companiesData = Array.isArray(companies?.content) ? companies.content : []
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      designation: category?.designation || "",
      code: category?.code || "",
      companyId: category?.companyId || 0,
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
                <FormLabel>Company</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
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
                  Choose the company for this category.
                </FormDescription>
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
