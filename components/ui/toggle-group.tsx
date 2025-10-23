import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToggleGroupProps {
  type: "single"
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const ToggleGroup = ({ className, children, ...props }: ToggleGroupProps) => (
  <div className={cn("flex items-center gap-1 rounded-md bg-muted p-1", className)}>
    {children}
  </div>
)

interface ToggleGroupItemProps {
  value: string
  "aria-label": string
  children: React.ReactNode
  className?: string
}

const ToggleGroupItem = ({ value, children, className, ...props }: ToggleGroupItemProps) => {
  const parent = React.useContext(ToggleContext)
  const isActive = parent?.value === value
  
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={() => parent?.onValueChange(value)}
      className={cn("h-8 px-2", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

const ToggleContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

const ToggleGroupWithContext = ({ value, onValueChange, children, ...props }: ToggleGroupProps) => (
  <ToggleContext.Provider value={{ value, onValueChange }}>
    <ToggleGroup {...props}>{children}</ToggleGroup>
  </ToggleContext.Provider>
)

export { ToggleGroupWithContext as ToggleGroup, ToggleGroupItem }