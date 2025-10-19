import { toast } from "sonner"
import { useUserStore } from '@/stores/userStore'

interface ApiClientOptions {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
  skipAuth?: boolean // 👈 Nouvelle option pour endpoints publics
}

class ApiClient {
  private readonly baseURL: string
  private onUnauthorized?: () => void

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || ""
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler
  }

  // Récupérer le token depuis Zustand
  private getToken(): string | null {
    return useUserStore.getState().accessToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    clientOptions: ApiClientOptions = {}
  ): Promise<T> {
    const { 
      showErrorToast = true, 
      showSuccessToast = false, 
      successMessage,
      skipAuth = false 
    } = clientOptions

    // Ne pas définir Content-Type pour FormData (le navigateur le fera automatiquement)
    const isFormData = options.body instanceof FormData
    const headers: Record<string, string> = {}
    
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    // Ajouter les headers personnalisés s'ils existent
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Ajouter le token seulement si nécessaire et disponible
    const token = this.getToken()
    if (!skipAuth && token) {
      headers.Authorization = `Bearer ${token}`
    }

    const url = `${this.baseURL}${endpoint}`.replace(/([^:])\/{2,}/g, '$1/')
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })
      
      return await this.handleResponse<T>(response, showErrorToast, showSuccessToast, successMessage)
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const corsError = 'Erreur de connexion au serveur. Le backend doit autoriser votre domaine Vercel.'
        if (showErrorToast) {
          toast.error('Problème CORS', { description: corsError })
        }
        throw new Error(corsError)
      }
      throw err
    }
  }

  private async handleResponse<T>(
    response: Response,
    showErrorToast: boolean,
    showSuccessToast: boolean,
    successMessage?: string
  ): Promise<T> {
    // Gestion des erreurs d'authentification
    if (response.status === 401 || response.status === 403) {
      const { clearUser } = useUserStore.getState()
      clearUser() // 👈 Nettoyage automatique du store
      
      if (showErrorToast) {
        toast.error("Session expirée", { 
          description: "Veuillez vous reconnecter" 
        })
      }
      
      // Redirection vers login seulement si pas déjà sur une page d'auth
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
      
      throw new Error("Non autorisé")
    }

    // Gestion des réponses vides (204 No Content)
    if (response.status === 204) {
      if (showSuccessToast && successMessage) {
        toast.success(successMessage)
      }
      return {} as T
    }

    // Lire le body une seule fois
    let responseText: string
    try {
      responseText = await response.text()
    } catch {
      throw new Error("Impossible de lire la réponse du serveur")
    }

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`
      let errorDetails = null
      
      if (responseText) {
        try {
          const errorRes = JSON.parse(responseText)
          errorMessage = errorRes.message || errorRes.details || errorMessage
          errorDetails = errorRes
          console.error('Erreur backend détaillée:', errorRes)
        } catch {
          errorMessage = responseText || errorMessage
          console.error('Réponse d\'erreur brute:', responseText)
        }
      }
      
      if (showErrorToast) {
        toast.error("Erreur", { description: errorMessage })
      }
      
      const error = new Error(errorMessage)
      // Ajouter les détails de l'erreur pour le débogage
      if (errorDetails) {
        (error as any).details = errorDetails
      }
      
      throw error
    }

    // Parser la réponse JSON
    let data: T
    try {
      data = responseText ? JSON.parse(responseText) : ({} as T)
    } catch {
      // Si ce n'est pas du JSON, retourner le texte comme données
      data = responseText as unknown as T
    }

    if (showSuccessToast && successMessage) {
      toast.success(successMessage)
    }

    return data
  }

  async get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, options)
  }

  async post<T>(endpoint: string, data?: unknown, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      },
      options
    )
  }

  async put<T>(endpoint: string, data?: unknown, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      },
      options
    )
  }

  async patch<T>(endpoint: string, data?: unknown, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      },
      options
    )
  }

  async delete<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, options)
  }

  // Méthode utilitaire pour obtenir l'URL de base (utile pour les appels FormData personnalisés)
  getBaseURL(): string {
    return this.baseURL
  }
}

export const apiClient = new ApiClient()

// Hook personnalisé pour l'authentification
export function useAuth() {
  const { user, accessToken, isAuthenticated, clearUser } = useUserStore()
  
  return {
    user,
    token: accessToken,
    isAuthenticated,
    logout: clearUser,
  }
}