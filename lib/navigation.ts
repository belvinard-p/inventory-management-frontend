import { type UserRole } from "@/types"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  Receipt,
  Building,
  Tags,
  BarChart3,
  UserCheck,
} from "lucide-react"

export interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles: string[]
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES", "ROLE_USER"],
  },
  {
    title: "Articles",
    href: "/dashboard/articles",
    icon: Package,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES", "ROLE_USER"],
  },
  {
    title: "Catégories",
    href: "/dashboard/categories",
    icon: Tags,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES", "ROLE_USER"],
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  },
  {
    title: "Commandes",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  },
  {
    title: "Fournisseurs",
    href: "/dashboard/suppliers",
    icon: Truck,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  },
  {
    title: "Ventes",
    href: "/dashboard/sales",
    icon: Receipt,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  },
  {
    title: "Entreprises",
    href: "/dashboard/company",
    icon: Building,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER"],
  },
  {
    title: "Rapports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["ROLE_ADMIN"],
  },
  {
    title: "Utilisateurs",
    href: "/dashboard/users",
    icon: UserCheck,
    roles: ["ROLE_ADMIN"],
  },
];

export function getNavigationForRole(userRoles: string[]): NavigationItem[] {
  // Déterminer le rôle principal (le plus élevé)
  const roleHierarchy = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_SALES', 'ROLE_USER']
  const primaryRole = roleHierarchy.find(role => userRoles.includes(role))
  const roleSlug = primaryRole?.replace('ROLE_', '').toLowerCase()
  
  return navigationConfig
    .filter((item) => item.roles.some(role => userRoles.includes(role)))
    .map((item) => ({
      ...item,
      href: item.href === '/dashboard' ? `/dashboard/${roleSlug}` : `/dashboard/${roleSlug}${item.href.replace('/dashboard', '')}`
    }))
}

export function getNavigationForSingleRole(role: UserRole): NavigationItem[] {
  const roleWithPrefix = `ROLE_${role}`
  return navigationConfig.filter((item) => item.roles.includes(roleWithPrefix))
}
