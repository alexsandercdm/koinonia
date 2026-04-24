import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/use-auth'

// O tipo exato do retorno do Better Auth é complexo — usamos unknown para evitar incompatibilidade
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoginResult = any

export interface AuthContextType {
  user: any
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  register: (email: string, password: string, name: string) => Promise<LoginResult>
  logout: () => void
  loginLoading: boolean
  registerLoading: boolean
  logoutLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
