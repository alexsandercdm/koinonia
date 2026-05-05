import { createContext, useContext, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth'

interface OrgContextType {
  activeOrgId: string | null
  userRole: string | null
  isLoading: boolean
  organizations: Array<{ id: string; name: string; slug: string }>
  setActiveOrg: (orgId: string) => Promise<void>
  createOrganization: (input: { name: string; slug: string }) => Promise<void>
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

  const orgListQuery = authClient.useListOrganizations?.()
  const organizations = (orgListQuery?.data ?? []).map((org: any) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
  }))

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

  async function createOrganization(input: { name: string; slug: string }) {
    const organizationApi = authClient.organization ?? {}
    const createOrganizationAction =
      organizationApi.createOrganization ??
      organizationApi.create

    if (typeof createOrganizationAction !== 'function') {
      throw new Error('Organization client is not available')
    }

    await createOrganizationAction(input)
    queryClient.clear()
    navigate('/dashboard')
  }

  return (
    <OrgContext.Provider
      value={{
        activeOrgId,
        userRole,
        isLoading,
        organizations,
        setActiveOrg,
        createOrganization,
      }}
    >
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
