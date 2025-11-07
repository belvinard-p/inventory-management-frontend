import { useMemo } from 'react'
import { useUsers } from './useUsers'
import { User } from '@/types'

export const useUserStats = () => {
  const { data: users, isLoading, error } = useUsers()
  
  const stats = useMemo(() => {
    if (!users) return null
    
    return {
      total: users.length,
      active: users.filter((u: User) => u.enabled).length,
      inactive: users.filter((u: User) => !u.enabled).length,
      locked: users.filter((u: User) => !u.accountNonLocked).length,
      byRole: users.reduce((acc: Record<string, number>, user: User) => {
        const role = user.roleName.replace('ROLE_', '')
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {}),
      recentlyCreated: users.filter((u: User) => {
        if (!u.createdDate) return false
        const created = new Date(u.createdDate)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return created > weekAgo
      }).length
    }
  }, [users])
  
  return {
    stats,
    isLoading,
    error
  }
}