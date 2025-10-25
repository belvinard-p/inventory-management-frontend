"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { Info, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { GoogleLogin } from "@/components/modules/auth/google-login"
import { GithubLogin } from "@/components/modules/auth/github-login"
import { SubmitButton, Logo, FormErrorState } from "@/components/global"
import Link from "next/link"
import { useUserStore } from "@/stores/userStore"
import { LoginRequest, User } from "@/types/user"
import { TEST_ACCOUNTS } from "@/lib/testAccounts"
import { authService } from "@/lib/authService"
import { toast } from "sonner"

const LoginSchema = z.object({
    username: z.string().min(1, "Nom d'utilisateur requis"),
    password: z.string().min(1, "Mot de passe requis"),
})

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { username: "", password: "" },
    })

    const router = useRouter()
    
    // 🔥 CHANGEMENT : Sélectionner précisément ce dont on a besoin
    const setUser = useUserStore(state => state.setUser)
    const setTokens = useUserStore(state => state.setTokens)

    const fillTestAccount = useCallback((username: string, password: string) => {
        form.setValue("username", username)
        form.setValue("password", password)
    }, [form])

    const handleForgotPassword = useCallback(() => {
        router.push('/forgot-password')
    }, [router])

    const onSubmit = useCallback(async (data: LoginRequest) => {
        setLoading(true)
        setError(null)
        try {
            console.log(`Tentative de connexion ${retryCount + 1} avec:`, data.username)
            const result = await authService.signIn(data)
            console.log('Réponse authService:', result)
            
            // Reset retry count on success
            setRetryCount(0)

            if (!result || !result.jwtToken) {
                throw new Error("Réponse invalide du serveur")
            }

            const user: User = {
                userId: 0,
                firstName: "",
                lastName: "",
                userName: result.username || data.username,
                email: "",
                accountNonLocked: true,
                accountNonExpired: true,
                credentialsNonExpired: true,
                enabled: true,
                roleName: result.roles?.[0] || 'ROLE_USER',
            }

            console.log('Mise à jour du store avec:', user)
            
            // 🔥 CHANGEMENT : Appels séparés et simples
            setUser(user)
            setTokens(result.jwtToken, result.refreshToken || result.jwtToken)
            
            toast.success("Connexion réussie !")
            
            // 🔥 CHANGEMENT : Redirection différée
            setTimeout(() => {
                console.log('Redirection vers /dashboard')
                router.push("/dashboard")
            }, 500)
            
        } catch (err: unknown) {
            console.error('Erreur de connexion:', err)
            const errorMessage = err instanceof Error ? err.message : "Erreur de connexion"
            
            // Handle timeout/slow connection with retry suggestion
            if (errorMessage.includes('Connexion lente') || errorMessage.includes('expirée')) {
                setRetryCount(prev => prev + 1)
                if (retryCount < 2) {
                    setError(`${errorMessage} (Tentative ${retryCount + 1}/3)`)
                    toast.error('Connexion lente', {
                        description: 'Cliquez sur "Se connecter" pour réessayer',
                        duration: 4000
                    })
                } else {
                    setError('Serveur indisponible - Vérifiez votre connexion internet')
                    toast.error('Serveur indisponible', {
                        description: 'Le serveur ne répond pas. Contactez l\'administrateur.',
                        duration: 6000
                    })
                }
            } else {
                setError(errorMessage)
                toast.error(errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }, [setUser, setTokens, router, retryCount])

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <Logo size="xl" className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Gérez votre inventaire
                        <br />
                        <span className="text-primary-foreground/80">en toute simplicité</span>
                    </h1>
                    <p className="text-xl text-primary-foreground/70 mb-8 leading-relaxed">
                        Une solution moderne et intuitive pour optimiser la gestion de vos stocks et améliorer votre productivité.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-primary-foreground/80">Suivi en temps réel</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-primary-foreground/80">Rapports détaillés</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-primary-foreground/80">Interface moderne</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background via-background to-muted/10">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-6">
                        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-700">
                            <Logo size="lg" />
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200 p-8 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/30 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-6">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Bon retour !</h2>
                            <p className="text-muted-foreground">Connectez-vous pour accéder à votre tableau de bord</p>
                            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto lg:mx-0" />
                        </div>
                        <FormErrorState error={error} />
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Nom d&apos;utilisateur</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder="admin"
                                                        {...field}
                                                        disabled={loading}
                                                        className="h-12 pl-4 pr-4 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-xl hover:border-border/60"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="group">
                                            <FormLabel className="text-sm font-medium text-foreground/80 group-focus-within:text-primary transition-colors">Mot de passe</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        {...field}
                                                        disabled={loading}
                                                        className="h-12 pl-4 pr-12 bg-background/50 border-2 border-border/40 focus:border-primary/60 focus:bg-background transition-all duration-300 rounded-xl hover:border-border/60"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-muted/50 transition-colors"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={loading}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="px-0 font-normal text-sm"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        Mot de passe oublié ?
                                    </Button>
                                </div>
                                
                                <SubmitButton 
                                    isLoading={loading} 
                                    className="h-12 mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium"
                                >
                                    Se connecter
                                </SubmitButton>
                            </form>
                        </Form>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <GoogleLogin />
                            <GithubLogin />
                        </div>
                        
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">Pas de compte ?</p>
                            <Button asChild variant="outline" className="w-full h-11 group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary bg-gradient-to-r from-white to-gray-50 hover:from-primary/5 hover:to-primary/10">
                                <Link href="/register">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="font-medium text-gray-700 group-hover:text-primary transition-colors duration-300 relative z-10">
                                        Créer un compte
                                    </span>
                                </Link>
                            </Button>
                        </div>
                        
                        <Button variant="ghost" asChild className="w-full hover:bg-muted/50 hover:text-primary transition-colors">
                            <Link href="/" className="flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Retour à l&apos;accueil
                            </Link>
                        </Button>
                    </div>

                    {/* Demo Accounts */}
                    <div className="mt-8 p-5 bg-card rounded-xl border-2 border-border/40 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1 bg-primary/10 rounded-full">
                                <Info className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">Comptes de démonstration</span>
                        </div>
                        <div className="grid gap-3">
                            {TEST_ACCOUNTS.map((account) => {
                                const IconComponent = account.icon
                                return (
                                    <button
                                        key={account.username}
                                        onClick={() => fillTestAccount(account.username, account.password)}
                                        disabled={loading}
                                        className="group flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                                            <IconComponent className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{account.role}</p>
                                            <p className="text-xs text-muted-foreground">{account.name}</p>
                                        </div>
                                        <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                            Cliquer pour utiliser
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}