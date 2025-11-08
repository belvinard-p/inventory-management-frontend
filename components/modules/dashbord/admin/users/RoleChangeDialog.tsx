"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "@/types"
import { useUpdateUserRole } from "@/hooks/user/useUsers"

interface RoleChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  roles: Array<{id: number, roleName: string}>
}

export function RoleChangeDialog({ open, onOpenChange, user, roles }: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.roleName)
  const updateRole = useUpdateUserRole()

  const handleRoleChange = () => {
    if (selectedRole && selectedRole !== user.roleName) {
      updateRole.mutate({
        userId: user.userId,
        roleName: selectedRole
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Changer le rôle</DialogTitle>
          <DialogDescription>
            Modifier le rôle de {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rôle actuel: {user.roleName}</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={`role-${role.id}-${role.roleName}`} value={role.roleName}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleRoleChange}
            disabled={!selectedRole || selectedRole === user.roleName || updateRole.isPending}
          >
            {updateRole.isPending ? "Modification..." : "Modifier le rôle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}