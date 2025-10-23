"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  fallbackClassName,
  placeholder,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer pour détecter quand l'image entre dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && !hasError && (
        <div className={cn("absolute inset-0 flex items-center justify-center", fallbackClassName)}>
          {placeholder || (
            <div className="animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted w-full h-full" />
          )}
        </div>
      )}

      {/* Image lazy loadée */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Fallback en cas d'erreur */}
      {hasError && (
        <div className={cn("flex items-center justify-center", fallbackClassName)}>
          {placeholder}
        </div>
      )}
    </div>
  )
}