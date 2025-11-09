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
  UserCircle,
  PackageCheck,
} from "lucide-react"

export interface NavigationItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles: string[]
  subItems?: NavigationSubItem[]
}

export interface NavigationSubItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
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
    icon: ShoppingCart,
    roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
    subItems: [
      {
        title: "Commandes Clients",
        href: "/dashboard/orders/clients",
        icon: UserCircle,
        roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
      },
      {
        title: "Commandes Fournisseurs",
        href: "/dashboard/orders/suppliers",
        icon: PackageCheck,
        roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
      },
    ],
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
    .map((item) => {
      // Filtrer et adapter les sous-items si présents
      const filteredSubItems = item.subItems
        ?.filter(subItem => subItem.roles.some(role => userRoles.includes(role)))
        .map(subItem => ({
          ...subItem,
          href: `/dashboard/${roleSlug}${subItem.href.replace('/dashboard', '')}`
        }))
      
      return {
        ...item,
        href: item.href ? (item.href === '/dashboard' ? `/dashboard/${roleSlug}` : `/dashboard/${roleSlug}${item.href.replace('/dashboard', '')}`) : undefined,
        subItems: filteredSubItems
      }
    })
}

export function getNavigationForSingleRole(role: UserRole): NavigationItem[] {
  const roleWithPrefix = `ROLE_${role}`
  return navigationConfig.filter((item) => item.roles.includes(roleWithPrefix))
}
