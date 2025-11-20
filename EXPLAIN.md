# 🔐 Système d'Authentification - Explication Technique

## Vue d'ensemble
Le système d'authentification de l'application utilise une architecture moderne avec **Next.js 14**, **React Hook Form**, **Zod** pour la validation, et **TanStack Query** pour la gestion d'état.

---

## 🏗️ Architecture des Composants

### 1. **Formulaire de Connexion** (`login-form.tsx`)

#### **Technologies utilisées :**
- **React Hook Form** : Gestion performante des formulaires
- **Zod** : Validation de schéma TypeScript-first
- **Zustand** : Store global pour l'état utilisateur
- **JWT (Jose)** : Authentification avec tokens sécurisés
- **Custom Auth Service** : API d'authentification personnalisée

#### **Fonctionnalités clés :**
```typescript
// Validation avec Zod
const LoginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
})

// Gestion d'état avec Zustand
const { setUser, setTokens } = useUserStore()
```

#### **Flux d'authentification :**
1. **Validation côté client** avec Zod
2. **Appel API** via `authService.signIn()`
3. **Stockage des tokens** JWT + Refresh Token
4. **Redirection** vers le dashboard selon le rôle

#### **Sécurité :**
- Tokens JWT stockés de manière sécurisée
- Validation des entrées utilisateur
- Gestion des erreurs centralisée

---

### 2. **Formulaire d'Inscription** (`signup-form.tsx`)

#### **Validation avancée :**
```typescript
const SignupSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
  username: z.string().min(4).max(10),
  email: z.string().email().max(50),
  password: z.string().min(6).max(40),
  confirmPassword: z.string().min(1),
  // Champs optionnels pour l'adresse
}).refine((data) => data.password === data.confirmPassword)
```

#### **UX Moderne :**
- **Validation en temps réel** avec indicateurs visuels
- **Feedback immédiat** (✓ vert, ✗ rouge)
- **États de chargement** pendant les requêtes
- **Animations fluides** avec Tailwind CSS

#### **Gestion des mutations :**
```typescript
const signupMutation = useSignup() // TanStack Query

// Transformation des données avant envoi
const { confirmPassword, address1, address2, ...baseData } = data
const address = (address1 || address2) ? { address1, address2 } : undefined
```

---

## 🎨 Design System & UX

### **Composants réutilisables :**
- **FormField** : Wrapper pour les champs avec validation
- **SubmitButton** : Bouton avec état de chargement
- **Logo** : Composant responsive avec variantes de taille

### **Micro-interactions :**
```css
/* Focus states avec Tailwind */
group-focus-within:text-primary
hover:border-primary/60
transition-all duration-300

/* Animations d'entrée */
animate-in fade-in-0 slide-in-from-bottom-4
```

### **Responsive Design :**
- **Mobile-first** : Adaptation automatique des layouts
- **Grid responsive** : `grid-cols-1 sm:grid-cols-2`
- **Espacement adaptatif** : `px-4 sm:px-8`

---
Merci

## 🔄 Gestion d'État

### **Store Zustand** (`userStore.ts`)
```typescript
interface UserStore {
  user: User | null
  tokens: { jwt: string; refresh: string } | null
  setUser: (user: User) => void
  setTokens: (jwt: string, refresh: string) => void
  logout: () => void
}
```

-- thanks

### **TanStack Query** pour les mutations
```typescript
const signupMutation = useMutation({
  mutationFn: signupService.signup,
  onSuccess: () => router.push('/login'),
  onError: (error) => toast.error(error.message)
})
```

---

## 🛡️ Sécurité & Validation

### **Authentification JWT :**
```typescript
// Vérification des tokens avec Jose
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

// Stockage sécurisé des cookies
cookieStore.set('accessToken', result.jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 // 24 heures
})
```

### **Validation multi-niveaux :**
1. **Client-side** : Zod schemas + React Hook Form
2. **Server-side** : Validation API backend
3. **Type safety** : TypeScript strict mode

### **Gestion des erreurs :**
```typescript
// Intercepteur Axios pour les erreurs globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error(error.response?.data?.message)
    return Promise.reject(error)
  }
)
```

---

## 🚀 Performance & Optimisation

### **Optimisations React :**
- **Lazy loading** des composants
- **Memoization** avec `useMemo` et `useCallback`
- **Debouncing** pour la validation en temps réel

### **Bundle optimization :**
- **Tree shaking** automatique
- **Code splitting** par route
- **Compression** des assets

---

## 📱 Fonctionnalités Avancées

### **Authentification JWT :**
```typescript
// Service d'authentification custom
const authService = {
  signIn: async (credentials: LoginRequest) => {
    const response = await apiClient.post('/auth/signin', credentials)
    return response.data
  }
}

// Gestion des tokens JWT
const { setUser, setTokens } = useUserStore()
setTokens(result.jwtToken, result.refreshToken)
```

### **OAuth Integration :**
```typescript
// Google OAuth
<GoogleLogin />

// GitHub OAuth
const handleGithubLogin = () => {
  window.location.href = `${baseUrl}/oauth2/authorization/github`
}
```

### **Comptes de démonstration :**
- **Auto-fill** pour les tests
- **Différents rôles** : Admin, Manager, Sales, User
- **Interface intuitive** avec icônes et descriptions

### **Gestion des thèmes :**
- **Dark/Light mode** avec `next-themes`
- **Variables CSS** pour la cohérence
- **Transitions fluides** entre les thèmes

---

## 🔧 Points Techniques Avancés

### **Custom Hooks :**
```typescript
// Hook personnalisé pour l'inscription
export const useSignup = () => {
  return useMutation({
    mutationFn: signupService.signup,
    onSuccess: () => {
      toast.success("Compte créé avec succès!")
      setTimeout(() => router.push('/login'), 2000)
    }
  })
}
```

### **Type Safety :**
```typescript
// Types stricts pour l'API
interface LoginRequest {
  username: string
  password: string
}

interface AuthResponse {
  jwtToken: string
  refreshToken: string
  username: string
  roles: string[]
}
```

---

## 📊 Métriques & Monitoring

### **Performance :**
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s
- **Bundle size** optimisé

### **UX Metrics :**
- **Form completion rate** trackée
- **Error rates** monitorées
- **User feedback** intégré

---

## 🎯 Démonstration Live

### **Scénarios de test :**
1. **Connexion normale** avec comptes démo
2. **Validation d'erreurs** en temps réel
3. **OAuth flows** (Google/GitHub)
4. **Responsive design** sur différents écrans
5. **Dark/Light mode** switching

### **Points à souligner :**
- **UX fluide** et moderne
- **Performance** optimisée
- **Sécurité** robuste
- **Code maintenable** et scalable



https://teledeclaration-dgi.cm/modules/Common/Account/Login.aspx