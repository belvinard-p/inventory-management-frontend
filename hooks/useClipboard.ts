"use client"

import { useState } from 'react'
import { enhancedToast } from '@/lib/toast-utils'

export function useClipboard() {
  const [isCopying, setIsCopying] = useState(false)

  const copyToClipboard = async (text: string, label?: string) => {
    if (!text) return false

    setIsCopying(true)
    
    try {
      await navigator.clipboard.writeText(text)
      
      enhancedToast.success(`${label || 'Texte'} copié`, {
        description: `"${text}" a été copié dans le presse-papiers`,
        duration: 2000
      })
      
      return true
    } catch (error) {
      // Fallback pour les navigateurs plus anciens
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        enhancedToast.success(`${label || 'Texte'} copié`, {
          description: `"${text}" a été copié dans le presse-papiers`,
          duration: 2000
        })
        
        return true
      } catch (fallbackError) {
        enhancedToast.error('Erreur de copie', {
          description: 'Impossible de copier dans le presse-papiers'
        })
        return false
      }
    } finally {
      setIsCopying(false)
    }
  }

  return { copyToClipboard, isCopying }
}