import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        const session = await authClient.getSession()
        return session.data
      } catch (error) {
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authClient.signIn.email({
        email,
        password,
      })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      name 
    }: { 
      email: string; 
      password: string; 
      name: string 
    }) => {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      queryClient.clear()
    },
  })

  const login = (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password })
  }

  const register = (email: string, password: string, name: string) => {
    return registerMutation.mutateAsync({ email, password, name })
  }

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    user: session?.user,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    login,
    register,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    logoutLoading: logoutMutation.isPending,
  }
}
