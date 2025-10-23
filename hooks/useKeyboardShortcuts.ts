"use client"

import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      )

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Hook spécialisé pour les raccourcis communs
export function useCommonShortcuts({
  onNew,
  onSearch,
  onEscape
}: {
  onNew?: () => void
  onSearch?: () => void
  onEscape?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (onNew) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: onNew,
      description: 'Ctrl+N - Nouveau'
    })
  }

  if (onSearch) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: onSearch,
      description: 'Ctrl+K - Rechercher'
    })
  }

  if (onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: onEscape,
      description: 'Escape - Fermer'
    })
  }

  useKeyboardShortcuts(shortcuts)
}