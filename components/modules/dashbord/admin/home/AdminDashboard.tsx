"use client"

import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw, Building2 } from "lucide-react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { FormLoadingState } from "@/components/global"
import { MetricCard, DashboardHeader, ControlsSection } from "@/components/shared/dashboard"
import { UserCheck, Archive, Lock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { userService } from "@/service/userService"
import { companyService } from "@/service/companyService"

export function AdminDashboard() {
    // Vérification des permissions admin
    const { isLoading: authLoading, hasRequiredRole } = useAuthGuard(['ROLE_ADMIN'])
    
    // État de gestion des données
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [lastFetch, setLastFetch] = useState<Date | null>(null)
    
    // Simulation de données - remplacer par de vrais appels API
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalProducts: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        activeManagers: 0,
        archivedItems: 0,
        lockedAccounts: 0,
        systemUptime: 0
    })
    
    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            // Récupérer le nombre réel d'utilisateurs et d'entreprises
            const [users, companies] = await Promise.all([
                userService.getAll(),
                companyService.getAll({ page: 0, size: 1 }) // On ne récupère qu'une page pour avoir totalElements
            ])
            
            const usersCount = users.length
            const companiesCount = companies.totalElements
            
            // Données avec les vrais nombres d'utilisateurs et d'entreprises
            setDashboardData({
                totalUsers: usersCount,
                totalCompanies: companiesCount,
                totalProducts: 1247,
                totalOrders: 89,
                monthlyRevenue: 125000,
                activeManagers: 8,
                archivedItems: 23,
                lockedAccounts: 3,
                systemUptime: 99.9
            })
            
            setLastFetch(new Date())
            setRetryCount(0)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
            setError(`Échec du chargement des données: ${errorMessage}`)
            
            // Retry automatique après 3 secondes (max 3 tentatives)
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1)
                    fetchDashboardData()
                }, 3000)
            }
        } finally {
            setIsLoading(false)
        }
    }, [retryCount])
    
    const handleManualRetry = useCallback(() => {
        setRetryCount(0)
        fetchDashboardData()
    }, [fetchDashboardData])
    
    // Extraction des données du state
    const {
        totalUsers,
        totalCompanies,
        totalProducts,
        totalOrders,
        monthlyRevenue,
        activeManagers,
        archivedItems,
        lockedAccounts,
        systemUptime
    } = dashboardData
    
    // Optimiser les calculs avec useMemo
    const formattedRevenue = useMemo(() => 
        `${monthlyRevenue.toLocaleString()} fcfa`, [monthlyRevenue]
    )
    
    const currentMonthYear = useMemo(() => 
        new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), []
    )
    
    const revenueDescription = useMemo(() => 
        `Revenus ${currentMonthYear}`, [currentMonthYear]
    )
    
    // Vérifier les états vides et la fraîcheur des données
    const hasData = useMemo(() => ({
        users: totalUsers > 0,
        companies: totalCompanies > 0,
        products: totalProducts > 0,
        orders: totalOrders > 0,
        revenue: monthlyRevenue > 0
    }), [totalUsers, totalCompanies, totalProducts, totalOrders, monthlyRevenue])
    
    const isDataStale = useMemo(() => {
        if (!lastFetch) return false
        return Date.now() - lastFetch.getTime() > 5 * 60 * 1000 // 5 minutes
    }, [lastFetch])
    
    // Chargement initial des données
    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])
    
    const handleUserClick = useCallback(() => {
        console.log('Navigate to users')
    }, [])
    
    const handleCompaniesClick = useCallback(() => {
        console.log('Navigate to companies')
    }, [])
    
    const handleProductsClick = useCallback(() => {
        console.log('Navigate to products')
    }, [])
    
    const handleOrdersClick = useCallback(() => {
        console.log('Navigate to orders')
    }, [])
    
    const handleRevenueClick = useCallback(() => {
        console.log('Navigate to revenue')
    }, [])
    
    const handleManagersClick = useCallback(() => {
        console.log('Navigate to managers')
    }, [])
    
    const handleArchivedClick = useCallback(() => {
        console.log('Navigate to archived items')
    }, [])
    
    const handleLockedClick = useCallback(() => {
        console.log('Navigate to locked accounts')
    }, [])
    
    const handleSystemClick = useCallback(() => {
        console.log('Navigate to system settings')
    }, [])
    
    // Gérer les états de chargement d'authentification
    if (authLoading) {
        return <FormLoadingState isLoading={true}><div></div></FormLoadingState>
    }
    
    // Vérifier les permissions avant d'afficher le dashboard
    if (!hasRequiredRole) {
        return <FormLoadingState isLoading={true}><div></div></FormLoadingState>
    }
    
    // Affichage d'erreur critique
    if (error && retryCount >= 3) {
        return (
            <div className="space-y-6 mt-0 sm:mt-0 md:mt-12">
                <DashboardHeader
                    title="Administration"
                    subtitle="Erreur de chargement des données"
                    badgeText="Erreur"
                    badgeVariant="destructive"
                />
                
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleManualRetry}
                            className="ml-4"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Réessayer
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6 mt-0 sm:mt-0 md:mt-12">
            <DashboardHeader
                title="Administration"
                subtitle={isDataStale ? "Données obsolètes - Actualisation recommandée" : "Bienvenue ! Voici un aperçu de votre système d'inventaire."}
                badgeText={isDataStale ? "Données anciennes" : "Admin"}
            />
            
            {error && retryCount < 3 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>Tentative de reconnexion... ({retryCount + 1}/3)</span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleManualRetry}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Forcer
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <MetricCard
                    title="Total Utilisateurs"
                    value={totalUsers}
                    description="Utilisateurs du système"
                    icon={Users}
                    iconColor="text-blue-500"
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage="Échec du chargement des utilisateurs. Vérifiez votre connexion."
                    onRetry={handleManualRetry}
                    onClick={handleUserClick}
                    isEmpty={!isLoading && !error && totalUsers === 0}
                    emptyMessage="Aucun utilisateur enregistré dans le système"
                />
                
                <MetricCard
                    title="Total Entreprises"
                    value={totalCompanies}
                    description="Entreprises partenaires"
                    icon={Building2}
                    iconColor="text-orange-500"
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage="Échec du chargement des entreprises. Vérifiez votre connexion."
                    onRetry={handleManualRetry}
                    onClick={handleCompaniesClick}
                    isEmpty={!isLoading && !error && totalCompanies === 0}
                    emptyMessage="Aucune entreprise enregistrée dans le système"
                />
                
                <MetricCard
                    title="Produits"
                    value={totalProducts}
                    description="Articles en inventaire"
                    icon={Package}
                    iconColor="text-green-500"
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage="Impossible d'accéder aux données produits. Réessayez plus tard."
                    onRetry={handleManualRetry}
                    onClick={handleProductsClick}
                    isEmpty={!isLoading && !error && !hasData.products}
                    emptyMessage="Aucun produit en inventaire. Commencez par ajouter des articles."
                />
                
                <MetricCard
                    title="Commandes"
                    value={totalOrders}
                    description="Commandes ce mois"
                    icon={ShoppingCart}
                    iconColor="text-purple-500"
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage="Données de commandes indisponibles. Problème de synchronisation."
                    onRetry={handleManualRetry}
                    onClick={handleOrdersClick}
                    isEmpty={!isLoading && !error && !hasData.orders}
                    emptyMessage="Aucune commande ce mois. Les ventes vont bientôt démarrer !"
                />
                
                <MetricCard
                    title="Revenus du mois"
                    value={formattedRevenue}
                    description={revenueDescription}
                    icon={TrendingUp}
                    iconColor="text-green-500"
                    isLoading={isLoading}
                    isError={!!error}
                    errorMessage="Données financières temporairement inaccessibles. Contactez le support."
                    onRetry={handleManualRetry}
                    onClick={handleRevenueClick}
                    isEmpty={!isLoading && !error && !hasData.revenue}
                    emptyMessage="Aucun revenu enregistré ce mois. Première vente en attente."
                />
            </div>

            <ControlsSection
                title="Contrôles Administrateur"
                titleIcon={AlertTriangle}
                titleIconColor="text-orange-500"
                isLoading={isLoading}
                isError={!!error}
                onRetry={handleManualRetry}
                metrics={[
                    {
                        title: "Managers Actifs",
                        value: activeManagers,
                        description: "Équipe de gestion",
                        icon: UserCheck,
                        iconColor: "text-muted-foreground",
                        onClick: handleManagersClick,
                        isEmpty: !isLoading && !error && activeManagers === 0,
                        emptyMessage: "Aucun manager actif dans le système"
                    },
                    {
                        title: "Articles Archivés",
                        value: archivedItems,
                        description: "Produits archivés",
                        icon: Archive,
                        iconColor: "text-muted-foreground",
                        onClick: handleArchivedClick,
                        isEmpty: !isLoading && !error && archivedItems === 0,
                        emptyMessage: "Aucun élément archivé. Tout est actif !"
                    },
                    {
                        title: "Comptes Verrouillés",
                        value: lockedAccounts,
                        description: "Nécessitent attention",
                        icon: Lock,
                        iconColor: "text-orange-500",
                        onClick: handleLockedClick,
                        badge: lockedAccounts > 0 ? "Action requise" : undefined,
                        className: "border-orange-200",
                        isEmpty: !isLoading && !error && lockedAccounts === 0,
                        emptyMessage: "Aucun compte verrouillé. Sécurité optimale !"
                    },
                    {
                        title: "Système",
                        value: `${systemUptime}%`,
                        description: "Temps de fonctionnement",
                        icon: Settings,
                        iconColor: "text-muted-foreground",
                        onClick: handleSystemClick,
                        isEmpty: !isLoading && !error && systemUptime === 0,
                        emptyMessage: "Système hors ligne. Maintenance en cours."
                    }
                ]}
            />
        </div>
    )
}