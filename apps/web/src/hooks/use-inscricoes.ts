import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
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
  all: ['inscricoes'] as const,
  byEvento: (eventoId: string) => [...inscricoesKeys.all, 'evento', eventoId] as const,
  inadimplentes: (eventoId: string) => [...inscricoesKeys.all, 'inadimplentes', eventoId] as const,
}

// --------------- Inscrições por Evento ---------------

export function useInscricoes(eventoId: string) {
  return useQuery({
    queryKey: inscricoesKeys.byEvento(eventoId),
    queryFn: () => apiFetch<InscricaoListItem[]>(`/api/v1/inscricoes?evento_id=${eventoId}`),
    enabled: !!eventoId,
    staleTime: 0,
  })
}

// --------------- Inadimplentes por Evento ---------------

export function useInadimplentes(eventoId: string) {
  return useQuery({
    queryKey: inscricoesKeys.inadimplentes(eventoId),
    queryFn: () => apiFetch<InadimplenteItem[]>(`/api/v1/eventos/${eventoId}/inadimplentes`),
    enabled: !!eventoId,
    staleTime: 0,
  })
}
