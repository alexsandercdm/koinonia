import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreatePessoa, Pessoa, UpdatePessoa } from '@koinonia/shared'
import { apiFetch, ApiListResponse } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'

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
  all: (orgId: string | null) => ['org', orgId, 'participantes'] as const,
  lists: (orgId: string | null) => [...participantesKeys.all(orgId), 'list'] as const,
  list: (orgId: string | null, params: ParticipanteListParams) => [...participantesKeys.lists(orgId), params] as const,
  detail: (orgId: string | null, id: string) => [...participantesKeys.all(orgId), 'detail', id] as const,
  historico: (orgId: string | null, id: string) => [...participantesKeys.all(orgId), 'historico', id] as const,
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
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: participantesKeys.list(activeOrgId, params),
    queryFn: () => apiFetch<ApiListResponse<Pessoa>>(buildParticipantesPath(params)),
    enabled: !!activeOrgId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useParticipante(id: string, enabled = true) {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: participantesKeys.detail(activeOrgId, id),
    queryFn: () => apiFetch<Pessoa>(`/api/v1/participantes/${id}`),
    enabled: enabled && !!activeOrgId && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useParticipanteHistorico(id: string, enabled = true) {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: participantesKeys.historico(activeOrgId, id),
    queryFn: () => apiFetch<ParticipanteHistoricoItem[]>(`/api/v1/participantes/${id}/historico`),
    enabled: enabled && !!activeOrgId && !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateParticipante() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePessoa) =>
      apiFetch<Pessoa>('/api/v1/participantes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.all(activeOrgId) })
    },
  })
}

export function useUpdateParticipante() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePessoa }) =>
      apiFetch<Pessoa>(`/api/v1/participantes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_participante, { id }) => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.all(activeOrgId) })
      queryClient.invalidateQueries({ queryKey: participantesKeys.detail(activeOrgId, id) })
      queryClient.invalidateQueries({ queryKey: participantesKeys.historico(activeOrgId, id) })
    },
  })
}

export function useDeleteParticipante() {
  const { activeOrgId } = useOrgContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/v1/participantes/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: participantesKeys.all(activeOrgId) })
      queryClient.removeQueries({ queryKey: participantesKeys.detail(activeOrgId, id) })
    },
  })
}
