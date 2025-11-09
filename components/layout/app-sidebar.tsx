"use client"

import { Package, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { UserMenu } from "@/components/layout/user-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getNavigationForRole } from "@/lib/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"



export function AppSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Récupération de la navigation basée sur les rôles de l'utilisateur
  const navigationItems = user?.roleName ? getNavigationForRole([user.roleName]) : []
  
  // Debug temporaire
  console.log('Current user role:', user?.roleName)
  console.log('Navigation items for user:', navigationItems.map(item => item.title))
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/admin" || pathname === "/dashboard/manager" || pathname === "/dashboard/sales"
    }
    return pathname === href
  }
  
  const isParentActive = (subItems?: Array<{ href: string }>) => {
    if (!subItems) return false
    return subItems.some(subItem => pathname === subItem.href)
  }
  
  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <Sidebar collapsible="icon" className="z-[60] border-r overflow-x-hidden max-w-none" style={{ '--sidebar-background': 'hsl(var(--muted))' } as React.CSSProperties}>
      <SidebarHeader>
        <div className="flex items-center justify-end p-2">
          <SidebarTrigger />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Inventory Pro</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
                          <SidebarMenuButton
                            className={cn(
                              "flex items-center gap-2 w-full p-2 rounded-md transition-colors duration-200",
                              "hover:!bg-primary/15 hover:!text-primary focus-visible:ring-2 focus-visible:ring-primary",
                              isParentActive(item.subItems) ? "!bg-primary/15 !text-primary font-medium" : "text-sidebar-foreground"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4", isParentActive(item.subItems) && "!text-primary")} aria-hidden="true" />
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
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive(subItem.href)}
                                >
                                  <a
                                    href={subItem.href}
                                    className={cn(
                                      "flex items-center gap-2",
                                      isActive(subItem.href) && "font-medium"
                                    )}
                                  >
                                    <subItem.icon className="h-4 w-4" aria-hidden="true" />
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
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <a 
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 w-full p-2 rounded-md transition-colors duration-200",
                          "hover:!bg-primary/15 hover:!text-primary focus-visible:ring-2 focus-visible:ring-primary",
                          isActive(item.href!) ? "!bg-primary/15 !text-primary font-medium" : "text-sidebar-foreground"
                        )}
                        aria-current={isActive(item.href!) ? "page" : undefined}
                      >
                        <item.icon className={cn("h-4 w-4", isActive(item.href!) && "!text-primary")} aria-hidden="true" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-primary/20 text-primary px-1 rounded">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}