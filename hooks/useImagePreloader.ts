"use client"

import { useEffect, useState } from 'react'

interface UseImagePreloaderOptions {
  urls: string[]
  priority?: boolean
}

export function useImagePreloader({ urls, priority = false }: UseImagePreloaderOptions) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (urls.length === 0) {
      setIsLoading(false)
      return
    }

    const imagePromises = urls.map(url => {
      return new Promise<{ url: string; success: boolean }>((resolve) => {
        const img = new Image()
        
        img.onload = () => resolve({ url, success: true })
        img.onerror = () => resolve({ url, success: false })
        
        // Définir la priorité de chargement
        if (priority) {
          img.loading = 'eager'
        }
        
        img.src = url
      })
    })

    Promise.allSettled(imagePromises).then((results) => {
      const loaded = new Set<string>()
      const failed = new Set<string>()

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { url, success } = result.value
          if (success) {
            loaded.add(url)
          } else {
            failed.add(url)
          }
        }
      })

      setLoadedImages(loaded)
      setFailedImages(failed)
      setIsLoading(false)
    })
  }, [urls, priority])

  return {
    loadedImages,
    failedImages,
    isLoading,
    isImageLoaded: (url: string) => loadedImages.has(url),
    isImageFailed: (url: string) => failedImages.has(url)
  }
}