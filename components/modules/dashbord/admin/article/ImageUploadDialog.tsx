"use client"

import { useState } from "react"
import { ArticleResponse } from "@/types/article"
import { useArticles } from "@/hooks/article/useArticle"
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
import { ArticleImage } from "./ArticleImage"

interface ImageUploadDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly article: ArticleResponse
}

export function ImageUploadDialog({ open, onOpenChange, article }: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { updateArticleImage, isUpdatingImage } = useArticles()



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image")
      return
    }

    // Vérifier l'extension du nom de fichier
    const validExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)$/i
    if (!validExtensions.test(file.name)) {
      toast.error("Le nom du fichier doit se terminer par une extension d'image valide (jpg, jpeg, png, gif, webp, bmp)")
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image")
      return
    }

    try {
      await new Promise((resolve, reject) => {
        updateArticleImage(
          { id: article.id, imageFile: selectedFile },
          {
            onSuccess: () => {
              setSelectedFile(null)
              setPreview(null)
              onOpenChange(false)
              resolve(true)
            },
            onError: (error) => reject(error)
          }
        )
      })
    } catch (error) {
      console.error('Upload failed:', error)
    }
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
            <Image className="h-5 w-5" aria-hidden="true" />
            Changer l&apos;image de {article.designation}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une nouvelle image pour cet article. Formats acceptés : JPG, PNG, GIF, WebP, BMP (max 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image actuelle */}
          {article.image && (
            <div className="space-y-2">
              <Label>Image actuelle</Label>
              <div className="flex items-center justify-center w-full h-32 bg-muted rounded-lg border overflow-hidden">
                <ArticleImage
                  articleId={article.id}
                  articleName={article.designation}
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
            <p className="text-xs text-muted-foreground">
              Le nom du fichier doit se terminer par une extension d&apos;image valide (.jpg, .jpeg, .png, .gif, .webp, .bmp)
            </p>
          </div>

          {/* Aperçu */}
          {preview && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="flex items-center justify-center w-full h-48 bg-muted rounded-lg border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Aperçu de la nouvelle image"
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

