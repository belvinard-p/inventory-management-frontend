"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { useCompanyImageUrl } from "@/hooks/useCompany"

interface CompanyImageProps {
  companyId: number
  companyName: string
  className?: string
  fallbackClassName?: string
  expirationMinutes?: number
}

export function CompanyImage({ 
  companyId, 
  companyName, 
  className = "w-10 h-10 rounded-md object-cover",
  fallbackClassName = "w-10 h-10 rounded-md bg-muted flex items-center justify-center",
  expirationMinutes = 15
}: CompanyImageProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const { data: imageUrl, isLoading, isError } = useCompanyImageUrl(companyId, expirationMinutes)

  if (isLoading) {
    return (
      <div className={fallbackClassName}>
        <div className="animate-pulse bg-muted-foreground/20 w-full h-full rounded-md" />
      </div>
    )
  }

  if (isError || !imageUrl || hasImageError) {
    return (
      <div className={fallbackClassName}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={`Image de ${companyName}`}
      className={className}
      onError={() => setHasImageError(true)}
    />
  )
}