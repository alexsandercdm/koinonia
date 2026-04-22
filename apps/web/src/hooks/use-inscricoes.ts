import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Evento } from '@koinonia/shared'

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

export interface EventoListItem {
  id: string
  nome: string
  status: string
  data_inicio: string
  data_fim: string
  capacidade_maxima: number
  local_id: string | null
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
  eventos: () => ['eventos'] as const,
  evento: (id: string) => ['eventos', id] as const,
}

// --------------- Eventos ---------------

export function useEventos() {
  return useQuery({
    queryKey: inscricoesKeys.eventos(),
    queryFn: () => apiFetch<EventoListItem[]>('/api/v1/eventos'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: inscricoesKeys.evento(id),
    queryFn: () => apiFetch<Evento>(`/api/v1/eventos/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
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
