import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreatePessoa, Pessoa, UpdatePessoa } from '@koinonia/shared'
import { apiFetch, ApiListResponse } from '../lib/api'

export interface ParticipanteListParams {
  q?: string
  page?: number
  pageSize?: number
}

export interface ParticipanteHistoricoItem {
  evento: {
    id: string
    nome: string
    data_inicio?: string
    data_fim?: string
  }
  inscricao: {
    id: string
    papel: 'encontrista' | 'servo'
    status: string
    valor_total: string | number
    valor_pago: string | number
  }
}

export const participantesKeys = {
  all: ['participantes'] as const,
  lists: () => [...participantesKeys.all, 'list'] as const,
  list: (params: ParticipanteListParams) => [...participantesKeys.lists(), params] as const,
  detail: (id: string) => [...participantesKeys.all, 'detail', id] as const,
  historico: (id: string) => [...participantesKeys.all, 'historico', id] as const,
}

function buildParticipantesPath(params: ParticipanteListParams) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 100
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (params.q) {
    query.set('q', params.q)
  }

  return `/api/v1/participantes?${query.toString()}`
}

export function useParticipantes(params: ParticipanteListParams = {}) {
  return useQuery({
    queryKey: participantesKeys.list(params),
    queryFn: () => apiFetch<ApiListResponse<Pessoa>>(buildParticipantesPath(params)),
    staleTime: 1000 * 60 * 5,
  })
}

export function useParticipante(id: string, enabled = true) {
  return useQuery({
    queryKey: participantesKeys.detail(id),
    queryFn: () => apiFetch<Pessoa>(`/api/v1/participantes/${id}`),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useParticipanteHistorico(id: string, enabled = true) {
  return useQuery({
    queryKey: participantesKeys.historico(id),
    queryFn: () => apiFetch<ParticipanteHistoricoItem[]>(`/api/v1/participantes/${id}/historico`),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateParticipante() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePessoa) =>
      apiFetch<Pessoa>('/api/v1/participantes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.lists() })
    },
  })
}

export function useUpdateParticipante() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePessoa }) =>
      apiFetch<Pessoa>(`/api/v1/participantes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_participante, { id }) => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: participantesKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: participantesKeys.historico(id) })
    },
  })
}

export function useDeleteParticipante() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/participantes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.lists() })
      queryClient.removeQueries({ queryKey: participantesKeys.detail(id) })
    },
  })
}
