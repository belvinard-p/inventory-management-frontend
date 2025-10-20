"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompanies } from "@/hooks/useCompany"
import { Company } from "@/types"
import { Upload } from "lucide-react"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
}

export function ImageUploadDialog({ open, onOpenChange, company }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { updateCompanyImage, isUpdatingImage } = useCompanies()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      updateCompanyImage({ id: company.id, imageFile: selectedFile })
      setSelectedFile(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer l'image de {company.name}</DialogTitle>
          <DialogDescription>
            Sélectionnez une nouvelle image pour cette entreprise.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUpdatingImage}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdatingImage}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUpdatingImage}>
              <Upload className="h-4 w-4 mr-2" />
              {isUpdatingImage ? "Upload..." : "Uploader"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}