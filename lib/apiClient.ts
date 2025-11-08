import { toast } from "sonner"
import { useUserStore } from '@/stores/userStore'

interface ApiClientOptions {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
  skipAuth?: boolean // 👈 Nouvelle option pour endpoints publics
  responseType?: 'json' | 'blob' | 'text'
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
      skipAuth = false,
      responseType = 'json'
    } = clientOptions

    // Ajouter timeout et AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

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
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response, showErrorToast, showSuccessToast, successMessage, responseType)
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (err instanceof Error && err.name === 'AbortError') {
        const timeoutError = 'Connexion lente - Vérifiez votre réseau ou réessayez'
        if (showErrorToast) {
          toast.error('Connexion lente', { 
            description: timeoutError,
            duration: 5000
          })
        }
        throw new Error(timeoutError)
      }
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
    successMessage?: string,
    responseType: 'json' | 'blob' | 'text' = 'json'
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
        // Utiliser Next.js router pour la redirection côté client
        import('next/navigation').then(({ redirect }) => {
          setTimeout(() => {
            redirect('/login')
          }, 1000)
        }).catch(() => {
          // Fallback si Next.js router n'est pas disponible
          window.location.href = '/login'
        })
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

    // Handle different response types
    let responseData: unknown
    let responseText: string = ''
    
    try {
      if (responseType === 'blob') {
        responseData = await response.blob()
        return responseData as T
      } else if (responseType === 'text') {
        responseData = await response.text()
        responseText = responseData as string
      } else {
        // Default to JSON
        const contentType = response.headers.get('content-type')
        const isJson = contentType?.includes('application/json')
        
        if (isJson) {
          responseData = await response.json()
          responseText = JSON.stringify(responseData)
        } else {
          responseText = await response.text()
          responseData = responseText
        }
      }
    } catch {
      throw new Error("Impossible de lire la réponse du serveur")
    }

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`
      let errorDetails = null
      
      if (responseText) {
        try {
          // Si les données sont déjà parsées (JSON), les utiliser directement
          const contentType = response.headers.get('content-type')
          const isJson = contentType?.includes('application/json')
          const errorRes = isJson ? responseData : JSON.parse(responseText)
          errorMessage = errorRes.message || errorRes.details || errorMessage
          errorDetails = errorRes
          
          // Gérer les cas "No data found" comme des réponses valides
          if (response.status === 400 && errorRes.errors) {
            const errorText = errorRes.errors.error || errorRes.message || ''
            if (errorText.includes('No categories found') || 
                errorText.includes('No companies found') || 
                errorText.includes('No users found') ||
                errorText.includes('No articles found')) {
              console.warn('Base de données vide:', errorText)
              // Retourner une réponse vide au lieu de lancer une erreur
              return {
                content: [],
                pageNumber: 0,
                pageSize: 0,
                totalElements: 0,
                totalPages: 0,
                last: true
              } as T
            }
          }
          
          console.error('Erreur backend détaillée:', errorRes)
          if (errorRes.errors) {
            console.error('Détails de validation:', errorRes.errors)
            // Log each validation error
            Object.keys(errorRes.errors).forEach(field => {
              console.error(`Validation error for ${field}:`, errorRes.errors[field])
            })
          }
          if (errorRes.message) {
            console.error('Message d\'erreur:', errorRes.message)
          }
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
        (error as unknown as { details: unknown }).details = errorDetails
      }
      
      throw error
    }

    // Return the parsed data
    const data: T = responseData as T

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