"use client"

import { useImageQuery } from "@/hooks/useImageQuery"
import { useEffect } from "react"

interface AuthenticatedImageProps {
  filename: string
  alt: string
  className?: string
  onError?: () => void
  onLoad?: () => void
}

export function AuthenticatedImage({ filename, alt, className, onError, onLoad }: AuthenticatedImageProps) {
  const { data: imageSrc, isLoading, isError } = useImageQuery(filename)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageSrc && typeof imageSrc === 'string') {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [imageSrc])

  if (isLoading) {
    return <div className={`${className} animate-pulse bg-gray-200 rounded-full`} />
  }

  if (isError || !imageSrc) {
    onError?.()
    return null
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onLoad={onLoad}
      onError={() => {
        if (imageSrc && typeof imageSrc === 'string') {
          URL.revokeObjectURL(imageSrc)
        }
        onError?.()
      }}
    />
  )
}