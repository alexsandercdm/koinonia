import { createContext, useContext, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth'

interface OrgContextType {
  activeOrgId: string | null
  userRole: string | null
  isLoading: boolean
  setActiveOrg: (orgId: string) => Promise<void>
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const sessionQuery = authClient.useSession?.()
  const session = sessionQuery?.data
  const isLoading = sessionQuery?.isPending ?? sessionQuery?.isLoading ?? false

  const activeOrgId =
    session?.session?.activeOrganizationId ??
    session?.activeOrganizationId ??
    null

  const activeMemberQuery = authClient.useActiveMember?.()
  const activeMember = activeMemberQuery?.data ?? null
  const userRole = activeMember?.role ?? null

  async function setActiveOrg(orgId: string) {
    const organizationApi = authClient.organization ?? {}
    const setActive =
      organizationApi.setActiveOrganization ??
      organizationApi.setActive

    if (typeof setActive !== 'function') {
      throw new Error('Organization client is not available')
    }

    await setActive({ organizationId: orgId })
    queryClient.clear()
    navigate('/dashboard')
  }

  return (
    <OrgContext.Provider value={{ activeOrgId, userRole, isLoading, setActiveOrg }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrgContext() {
  const ctx = useContext(OrgContext)
  if (!ctx) {
    throw new Error('useOrgContext must be used within an OrgProvider')
  }
  return ctx
}
