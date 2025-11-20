"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { clientOrderService } from "@/service/client/clientOrderService"
import type { ClientOrderRequest } from "@/types/client/clientOrder"
import { toast } from "sonner"

export function useCreateCmdClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ClientOrderRequest) => clientOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande créée avec succès")
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création", {
        description: error?.message || "Une erreur est survenue"
      })
    },
  })
}

export function useUpdateCmdClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientOrderRequest }) =>
      clientOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] })
      toast.success("Commande mise à jour avec succès")
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour", {
        description: error?.message || "Une erreur est survenue"
      })
    },
  })
}
