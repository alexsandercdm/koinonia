import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { CreateEvento, Evento, EventoListItem, UpdateEvento } from '@koinonia/shared'

export const eventosKeys = {
  all: ['eventos'] as const,
  lists: () => [...eventosKeys.all, 'list'] as const,
  list: () => eventosKeys.lists(),
  detail: (id: string) => [...eventosKeys.all, 'detail', id] as const,
}

export function useEventos() {
  return useQuery({
    queryKey: eventosKeys.list(),
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: eventosKeys.detail(id),
    queryFn: () => apiFetch<Evento>(`/api/v1/eventos/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEvento) =>
      apiFetch<Evento>('/api/v1/eventos', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventosKeys.lists() })
    },
  })
}

export function useUpdateEvento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEvento }) =>
      apiFetch<Evento>(`/api/v1/eventos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventosKeys.detail(id) })
    },
  })
}
