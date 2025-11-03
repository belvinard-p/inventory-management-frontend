"use client"

import { useState } from "react"
import { Package } from "lucide-react"
import { useArticleImageUrl } from "@/hooks/article/useArticleImageUrl"
import { LazyImage } from "@/components/ui/lazy-image"

interface ArticleImageProps {
  articleId: number
  articleName: string
  className?: string
  fallbackClassName?: string
  expirationMinutes?: number
}

export function ArticleImage({ 
  articleId, 
  articleName, 
  className = "w-10 h-10 rounded-md object-cover",
  fallbackClassName = "w-10 h-10 rounded-md bg-muted flex items-center justify-center",
  expirationMinutes = 15
}: ArticleImageProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const { data: imageUrl, isLoading, isError } = useArticleImageUrl(articleId, expirationMinutes)

  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        <div className="animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted w-full h-full rounded-md" />
      </div>
    )
  }

  if (isError || hasImageError || (imageUrl === null)) {
    return (
      <div className={fallbackClassName}>
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }
  
  if (!imageUrl) {
    return (
      <div className={fallbackClassName}>
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <LazyImage
      src={imageUrl}
      alt={`Image de ${articleName}`}
      className={className}
      fallbackClassName={fallbackClassName}
      placeholder={<Package className="h-4 w-4 text-muted-foreground" />}
      onError={() => setHasImageError(true)}
    />
  )
}

