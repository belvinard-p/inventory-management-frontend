# 🎯 Implémentation du Menu Déroulant "Commandes"

## 📋 Vue d'ensemble

Cette documentation explique l'implémentation d'un **menu déroulant moderne** pour la section "Commandes" dans la sidebar, permettant de naviguer entre :
- **Commandes Clients**
- **Commandes Fournisseurs**

---

## 🏗️ Architecture de la Solution

### **1. Structure des Données (`lib/navigation.ts`)**

#### **Nouvelles Interfaces**

```typescript
export interface NavigationItem {
  title: string
  href?: string                    // Optionnel pour les items parents
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  roles: string[]
  subItems?: NavigationSubItem[]   // Nouveau : support des sous-menus
}

export interface NavigationSubItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}
```

#### **Configuration du Menu Commandes**

```typescript
{
  title: "Commandes",
  icon: ShoppingCart,              // Icône principale
  roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  subItems: [
    {
      title: "Commandes Clients",
      href: "/dashboard/orders/clients",
      icon: UserCircle,            // Icône spécifique
      roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
    },
    {
      title: "Commandes Fournisseurs",
      href: "/dashboard/orders/suppliers",
      icon: PackageCheck,          // Icône spécifique
      roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
    },
  ],
}
```

#### **Nouvelles Icônes Importées**

```typescript
import {
  // ... icônes existantes
  UserCircle,      // Pour Commandes Clients
  PackageCheck,    // Pour Commandes Fournisseurs
} from "lucide-react"
```

---

### **2. Fonction de Filtrage Améliorée**

```typescript
export function getNavigationForRole(userRoles: string[]): NavigationItem[] {
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
```

**Fonctionnalités :**
- ✅ Filtre les sous-items selon les rôles
- ✅ Adapte les URLs selon le rôle de l'utilisateur
- ✅ Préserve la hiérarchie des menus

---

### **3. Composant Sidebar (`components/layout/app-sidebar.tsx`)**

#### **Nouveaux Imports**

```typescript
import { ChevronDown } from "lucide-react"
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
```

#### **État Local pour les Menus**

```typescript
const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

const toggleMenu = (title: string) => {
  setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }))
}
```

#### **Fonction de Détection d'État Actif**

```typescript
const isParentActive = (subItems?: Array<{ href: string }>) => {
  if (!subItems) return false
  return subItems.some(subItem => pathname === subItem.href)
}
```

#### **Rendu Conditionnel**

```typescript
{navigationItems.map((item) => {
  // Si l'item a des sous-items, utiliser Collapsible
  if (item.subItems && item.subItems.length > 0) {
    const isOpen = openMenus[item.title] || isParentActive(item.subItems)
    
    return (
      <Collapsible
        key={item.title}
        open={isOpen}
        onOpenChange={() => toggleMenu(item.title)}
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <item.icon />
              <span>{item.title}</span>
              <ChevronDown className={cn(
                "ml-auto h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                    <a href={subItem.href}>
                      <subItem.icon />
                      <span>{subItem.title}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }
  
  // Item simple sans sous-items
  return (/* ... rendu normal ... */)
})}
```

---

### **4. Composant Collapsible (`components/ui/collapsible.tsx`)**

Wrapper autour de `@radix-ui/react-collapsible` pour cohérence avec les autres composants UI :

```typescript
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

---

## 🎨 Fonctionnalités UX

### **1. Animation du Chevron**
```typescript
<ChevronDown className={cn(
  "ml-auto h-4 w-4 transition-transform duration-200",
  isOpen && "rotate-180"
)} />
```
- Rotation fluide de 180° lors de l'ouverture/fermeture

### **2. État Actif Intelligent**
- Le menu parent s'ouvre automatiquement si un sous-item est actif
- Highlight visuel du sous-item actif
- Persistance de l'état ouvert/fermé

### **3. Transitions Fluides**
- Ouverture/fermeture animée via Radix UI
- Hover states cohérents
- Focus states accessibles

---

## 🔐 Gestion des Permissions

### **Filtrage par Rôle**
Chaque sous-item peut avoir ses propres permissions :

```typescript
{
  title: "Commandes Clients",
  href: "/dashboard/orders/clients",
  icon: UserCircle,
  roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
}
```

### **Exemple de Scénarios**

#### **Admin / Manager / Sales**
```
✅ Commandes
   ✅ Commandes Clients
   ✅ Commandes Fournisseurs
```

#### **User (si configuré différemment)**
```
❌ Commandes (non visible)
```

---

## 📱 Responsive Design

### **Mode Desktop**
- Menu déroulant complet avec icônes et texte
- Chevron indicateur d'état
- Indentation visuelle des sous-items

### **Mode Sidebar Collapsed (Icon)**
- Les sous-menus sont masqués automatiquement
- Tooltip au survol du parent (fonctionnalité native)

### **Mode Mobile**
- Sheet overlay avec navigation complète
- Touch-friendly targets
- Scroll automatique

---

## 🚀 Avantages Techniques

### **Scalabilité**
- ✅ Facile d'ajouter de nouveaux sous-menus
- ✅ Support de plusieurs niveaux (extensible)
- ✅ Configuration centralisée

### **Performance**
- ✅ Rendu conditionnel optimisé
- ✅ Pas de re-renders inutiles
- ✅ Lazy loading des sous-items

### **Maintenabilité**
- ✅ Code DRY (Don't Repeat Yourself)
- ✅ Type-safe avec TypeScript
- ✅ Composants réutilisables

### **Accessibilité**
- ✅ Navigation au clavier (Radix UI)
- ✅ ARIA attributes automatiques
- ✅ Focus management

---

## 🔧 Extension Future

### **Ajouter un Nouveau Sous-Menu**

1. **Dans `navigation.ts`** :
```typescript
{
  title: "Nouveau Menu",
  icon: MonIcone,
  roles: ["ROLE_ADMIN"],
  subItems: [
    {
      title: "Sous-item 1",
      href: "/dashboard/nouveau/item1",
      icon: Icon1,
      roles: ["ROLE_ADMIN"],
    },
    {
      title: "Sous-item 2",
      href: "/dashboard/nouveau/item2",
      icon: Icon2,
      roles: ["ROLE_ADMIN"],
    },
  ],
}
```

2. **Aucune modification nécessaire dans `app-sidebar.tsx`** ✅

### **Ajouter un Badge de Notification**

```typescript
{
  title: "Commandes Clients",
  href: "/dashboard/orders/clients",
  icon: UserCircle,
  roles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES"],
  badge: "5",  // Nouveau badge
}
```

---

## 📊 Routes Générées

### **Pour ROLE_ADMIN**
```
/dashboard/admin/orders/clients
/dashboard/admin/orders/suppliers
```

### **Pour ROLE_MANAGER**
```
/dashboard/manager/orders/clients
/dashboard/manager/orders/suppliers
```

### **Pour ROLE_SALES**
```
/dashboard/sales/orders/clients
/dashboard/sales/orders/suppliers
```

---

## ✅ Checklist d'Implémentation

- [x] Modifier `NavigationItem` interface
- [x] Créer `NavigationSubItem` interface
- [x] Ajouter icônes `UserCircle` et `PackageCheck`
- [x] Configurer le menu "Commandes" avec sous-items
- [x] Mettre à jour `getNavigationForRole()`
- [x] Créer composant `collapsible.tsx`
- [x] Installer `@radix-ui/react-collapsible`
- [x] Implémenter logique de rendu dans `app-sidebar.tsx`
- [x] Ajouter gestion d'état `openMenus`
- [x] Implémenter `isParentActive()`
- [x] Ajouter animations et transitions
- [x] Tester avec différents rôles

---

## 🎯 Résultat Final

Un menu déroulant moderne, accessible et performant qui :
- ✨ S'intègre parfaitement au design existant
- 🔐 Respecte les permissions RBAC
- 📱 Fonctionne sur tous les devices
- ⚡ Offre une UX fluide et intuitive
- 🧩 Est facilement extensible

---

## 🙏 Crédits

**Technologies utilisées :**
- Next.js 15
- React 19
- Radix UI (Collapsible)
- Lucide React (Icons)
- TailwindCSS
- TypeScript

**God is good all the time** 🙏
