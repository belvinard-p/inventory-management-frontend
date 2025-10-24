import { toast } from "sonner"

interface ToastAction {
  label: string
  onClick: () => void
}

interface EnhancedToastOptions {
  description?: string
  action?: ToastAction
  duration?: number
}

export const enhancedToast = {
  success: (message: string, options?: EnhancedToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  error: (message: string, options?: EnhancedToastOptions) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  warning: (message: string, options?: EnhancedToastOptions) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  info: (message: string, options?: EnhancedToastOptions) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  actionWithUndo: (message: string, undoAction: () => void, options?: Omit<EnhancedToastOptions, 'action'>) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 8000,
      action: {
        label: "Annuler",
        onClick: undoAction,
      },
    })
  }
}