import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'

export const orgKeys = {
  all: (orgId: string | null) => ['org', orgId] as const,
  members: (orgId: string | null) => [...orgKeys.all(orgId), 'members'] as const,
}

export function useOrgMembers() {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: orgKeys.members(activeOrgId),
    queryFn: () => apiFetch('/api/v1/organization/members'),
    enabled: !!activeOrgId,
  })
}

export function useInviteMember() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      apiFetch('/api/v1/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(activeOrgId) })
    },
  })
}
