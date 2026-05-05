import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'
import type { CreateEvento, Evento, EventoListItem, UpdateEvento } from '@koinonia/shared'

export const eventosKeys = {
  all: (orgId: string | null) => ['org', orgId, 'eventos'] as const,
  list: (orgId: string | null) => [...eventosKeys.all(orgId), 'list'] as const,
  detail: (orgId: string | null, id: string) => [...eventosKeys.all(orgId), 'detail', id] as const,
}

export function useEventos() {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: eventosKeys.list(activeOrgId),
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    enabled: !!activeOrgId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useEvento(id: string) {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: eventosKeys.detail(activeOrgId, id),
    queryFn: () => apiFetch<Evento>(`/api/v1/eventos/${id}`),
    enabled: !!activeOrgId && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEvento() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEvento) =>
      apiFetch<Evento>('/api/v1/eventos', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventosKeys.all(activeOrgId) })
    },
  })
}

export function useUpdateEvento() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEvento }) =>
      apiFetch<Evento>(`/api/v1/eventos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventosKeys.all(activeOrgId) })
      queryClient.invalidateQueries({ queryKey: eventosKeys.detail(activeOrgId, id) })
    },
  })
}
