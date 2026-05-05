import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import { useOrgContext } from '../contexts/org-context'
export { useEvento, useEventos } from './use-eventos'
export type { EventoListItem } from '@koinonia/shared'

// --------------- Types ---------------

export interface InscricaoListItem {
  id: string
  pessoa_id: string
  evento_id: string
  papel: 'encontrista' | 'servo'
  status: string
  valor_total: number
  valor_pago: number
  cama_id: string | null
  observacoes?: string
  created_at?: string
  pessoa?: {
    id: string
    nome: string
    genero: string
    telefone?: string
    email?: string
  }
}

export interface InadimplenteItem {
  id: string
  pessoa_id: string
  evento_id: string
  papel: 'encontrista' | 'servo'
  status: string
  valor_total: number
  valor_pago: number
  pessoa: {
    id: string
    nome: string
    telefone?: string
    email?: string
  }
}

// --------------- Query Keys ---------------

export const inscricoesKeys = {
  all: (orgId: string | null) => ['org', orgId, 'inscricoes'] as const,
  byEvento: (orgId: string | null, eventoId: string) => [...inscricoesKeys.all(orgId), 'evento', eventoId] as const,
  inadimplentes: (orgId: string | null, eventoId: string) => [...inscricoesKeys.all(orgId), 'inadimplentes', eventoId] as const,
}

// --------------- Inscrições por Evento ---------------

export function useInscricoes(eventoId: string) {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: inscricoesKeys.byEvento(activeOrgId, eventoId),
    queryFn: () => apiFetch<InscricaoListItem[]>(`/api/v1/inscricoes?evento_id=${eventoId}`),
    enabled: !!activeOrgId && !!eventoId,
    staleTime: 0,
  })
}

// --------------- Inadimplentes por Evento ---------------

export function useInadimplentes(eventoId: string) {
  const { activeOrgId } = useOrgContext()

  return useQuery({
    queryKey: inscricoesKeys.inadimplentes(activeOrgId, eventoId),
    queryFn: () => apiFetch<InadimplenteItem[]>(`/api/v1/eventos/${eventoId}/inadimplentes`),
    enabled: !!activeOrgId && !!eventoId,
    staleTime: 0,
  })
}
