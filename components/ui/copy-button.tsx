"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useClipboard } from "@/hooks/useClipboard"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface CopyButtonProps {
  text: string
  label?: string
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  className?: string
  showText?: boolean
}

export function CopyButton({ 
  text, 
  label, 
  variant = "ghost", 
  size = "sm",
  className,
  showText = false
}: CopyButtonProps) {
  const { copyToClipboard, isCopying } = useClipboard()
  const [justCopied, setJustCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text, label)
    if (success) {
      setJustCopied(true)
    }
  }

  useEffect(() => {
    if (justCopied) {
      const timer = setTimeout(() => setJustCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [justCopied])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isCopying || !text}
      className={cn(
        "transition-all duration-200",
        justCopied && "text-green-600",
        className
      )}
    >
      {justCopied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {showText && (
        <span className="ml-1">
          {justCopied ? "Copié" : "Copier"}
        </span>
      )}
    </Button>
  )
}