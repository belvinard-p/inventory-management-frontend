"use client"

import { useState } from "react"
import { Company } from "@/types"
import { useCompanies } from "@/hooks/useCompany"
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
import { Image, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { CompanyImage } from "./CompanyImage"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company
}

export function ImageUploadDialog({ open, onOpenChange, company }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { updateCompanyImage, isUpdatingImage } = useCompanies()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image")
      return
    }

    setSelectedFile(file)
    
    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image")
      return
    }

    updateCompanyImage({ id: company.id, imageFile: selectedFile })
    handleClose()
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Changer l&apos;image de {company.name}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une nouvelle image pour cette entreprise. Formats acceptés : JPG, PNG, WebP (max 1MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image actuelle */}
          {company.image && (
            <div className="space-y-2">
              <Label>Image actuelle</Label>
              <div className="flex items-center justify-center w-full h-32 bg-muted rounded-lg border overflow-hidden">
                <CompanyImage
                  companyId={company.id}
                  companyName={company.name}
                  className="max-w-full max-h-full object-contain"
                  fallbackClassName="w-full h-full flex items-center justify-center"
                />
              </div>
            </div>
          )}

          {/* Sélection de fichier */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Nouvelle image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUpdatingImage}
            />
          </div>

          {/* Aperçu */}
          {preview && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="flex items-center justify-center w-full h-48 bg-muted rounded-lg border overflow-hidden">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isUpdatingImage}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUpdatingImage}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUpdatingImage ? "Téléchargement..." : "Télécharger"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}