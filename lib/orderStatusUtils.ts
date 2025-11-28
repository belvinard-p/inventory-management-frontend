import { OrderStatus } from "@/types/supplier/supplierOrder"
import { OrderStatus as ClientOrderStatus } from "@/types/client/clientOrder"

export interface StatusConfig {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  color: string
}

export const ORDER_STATUS_CONFIG: Record<string, StatusConfig> = {
  "PENDING": {
    label: "En attente",
    variant: "secondary",
    color: "yellow-600"
  },
  "CONFIRMED": {
    label: "Confirmée",
    variant: "default", 
    color: "blue-600"
  },
  "COMPLETED": {
    label: "Complétée",
    variant: "outline",
    color: "green-600"
  },
  "CANCELLED": {
    label: "Annulée",
    variant: "destructive",
    color: "red-600"
  }
}

export function getStatusConfig(status: string): StatusConfig {
  const upperStatus = status?.toUpperCase()
  return ORDER_STATUS_CONFIG[upperStatus] || {
    label: status,
    variant: "outline",
    color: "gray-600"
  }
}

export function getStatusLabel(status: string): string {
  return getStatusConfig(status).label
}

export function calculateOrderStats(orders: Array<{ stateOrder: string }>) {
  const total = orders.length
  const pending = orders.filter(o => o.stateOrder?.toUpperCase() === "PENDING").length
  const confirmed = orders.filter(o => o.stateOrder?.toUpperCase() === "CONFIRMED").length
  const completed = orders.filter(o => o.stateOrder?.toUpperCase() === "COMPLETED").length
  const cancelled = orders.filter(o => o.stateOrder?.toUpperCase() === "CANCELLED").length

  return { total, pending, confirmed, completed, cancelled }
}

// Alias pour les commandes clients (même enum)
export const CLIENT_ORDER_STATUS_CONFIG = ORDER_STATUS_CONFIG
export function calculateClientOrderStats(orders: Array<{ stateOrder: string }>) {
  return calculateOrderStats(orders)
}