import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { 
    User, 
    RegisterRequest, 
    UpdateUserRequest, 
    UpdateRoleRequest,
    UpdatePasswordRequest,
    UpdateLockStatusRequest,
    UpdateEnabledStatusRequest,
    UpdateExpiryStatusRequest
} from '@/types'

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users'),
    staleTime: 2 * 60 * 1000,
  })
}

export const useUser = (userId?: number) => {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useRoles = () => {
  return useQuery<string[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/users/roles'),
    staleTime: 10 * 60 * 1000,
  })
}

export const useSearchUsers = (keyword: string) => {
  return useQuery<User[]>({
    queryKey: ['users', 'search', keyword],
    queryFn: () => apiClient.get(`/users/search?keyword=${keyword}`),
    enabled: keyword.length > 0,
    staleTime: 30 * 1000,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => 
      apiClient.post<User>('/users/register', data, {
        showSuccessToast: true,
        successMessage: 'Utilisateur créé avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => 
      apiClient.put<User>(`/users/${id}`, data, {
        showSuccessToast: true,
        successMessage: 'Utilisateur mis à jour avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: number) => 
      apiClient.delete(`/users/${userId}`, {
        showSuccessToast: true,
        successMessage: 'Utilisateur supprimé avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateRoleRequest) => 
      apiClient.put(`/users/${data.userId}/role`, { roleName: data.roleName }, {
        showSuccessToast: true,
        successMessage: 'Rôle mis à jour avec succès'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: (password: string) => 
      apiClient.put('/users/password', { password }, {
        showSuccessToast: true,
        successMessage: 'Mot de passe mis à jour avec succès'
      })
  })
}

export const useUpdateUserLockStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateLockStatusRequest) => 
      apiClient.put(`/users/${data.userId}/lock-status`, { lock: data.lock }, {
        showSuccessToast: true,
        successMessage: 'Statut de verrouillage mis à jour'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUserEnabledStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateEnabledStatusRequest) => 
      apiClient.put(`/users/${data.userId}/enabled-status`, { enabled: data.enabled }, {
        showSuccessToast: true,
        successMessage: 'Statut d\'activation mis à jour'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUserExpiryStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateExpiryStatusRequest) => 
      apiClient.put(`/users/${data.userId}/expiry-status`, { expire: data.expire }, {
        showSuccessToast: true,
        successMessage: 'Statut d\'expiration mis à jour'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUserCredentialsExpiryStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateExpiryStatusRequest) => 
      apiClient.put(`/users/${data.userId}/credentials-expiry-status`, { expire: data.expire }, {
        showSuccessToast: true,
        successMessage: 'Statut d\'expiration des identifiants mis à jour'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}