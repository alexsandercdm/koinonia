import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../contexts/auth-context'
import { useOrgContext } from '../contexts/org-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const { activeOrgId, isLoading: orgLoading } = useOrgContext()
  const location = useLocation()

  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!activeOrgId && location.pathname !== '/setup/organization') {
    return <Navigate to="/setup/organization" replace />
  }

  if (activeOrgId && location.pathname === '/setup/organization') {
    return <Navigate to="/dashboard" replace />
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
