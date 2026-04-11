import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Local, Quarto, Cama } from '@koinonia/shared'

// --------------- Types ---------------

export interface LocalPayload {
  nome: string
  endereco?: string
  capacidade_total?: number
}

export interface QuartoPayload {
  local_id: string
  nome: string
  genero_permitido: 'M' | 'F' | 'MISTO'
  capacidade: number
}

export interface CamaPayload {
  quarto_id: string
  identificacao: string
  tipo: 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal'
  bloqueada?: boolean
}

export interface CamaMapaItem {
  id: string
  identificacao: string
  tipo: string
  bloqueada: boolean
  ocupante: string | null
  inscricao_id: string | null
}

export interface QuartoMapaItem {
  id: string
  nome: string
  genero_permitido: 'M' | 'F' | 'MISTO'
  capacidade: number
  ocupados: number
  disponiveis: number
  camas: CamaMapaItem[]
}

export interface MapaAcomodacaoResponse {
  evento_id: string
  local_id: string | null
  quartos: QuartoMapaItem[]
}

// --------------- Query Keys ---------------

export const acomodacoesKeys = {
  all: ['acomodacoes'] as const,
  locais: () => [...acomodacoesKeys.all, 'locais'] as const,
  local: (id: string) => [...acomodacoesKeys.locais(), id] as const,
  quartos: (localId: string) => [...acomodacoesKeys.all, 'quartos', localId] as const,
  camas: (quartoId: string) => [...acomodacoesKeys.all, 'camas', quartoId] as const,
  mapa: (eventoId: string) => [...acomodacoesKeys.all, 'mapa', eventoId] as const,
}

// --------------- Locais Queries ---------------

export function useLocais() {
  return useQuery({
    queryKey: acomodacoesKeys.locais(),
    queryFn: () => apiFetch<Local[]>('/api/v1/acomodacoes/locais'),
    staleTime: 1000 * 60 * 5, // 5 minutes — offline grace
  })
}

// --------------- Quartos Queries ---------------

export function useQuartos(localId: string) {
  return useQuery({
    queryKey: acomodacoesKeys.quartos(localId),
    queryFn: () => apiFetch<Quarto[]>(`/api/v1/acomodacoes/locais/${localId}/quartos`),
    enabled: !!localId,
    staleTime: 1000 * 60 * 5,
  })
}

// --------------- Camas Queries ---------------

export function useCamas(quartoId: string) {
  return useQuery({
    queryKey: acomodacoesKeys.camas(quartoId),
    queryFn: () => apiFetch<Cama[]>(`/api/v1/acomodacoes/quartos/${quartoId}/camas`),
    enabled: !!quartoId,
    staleTime: 1000 * 60 * 5,
  })
}

// --------------- Mapa Query ---------------

export function useMapaAcomodacao(eventoId: string) {
  return useQuery({
    queryKey: acomodacoesKeys.mapa(eventoId),
    queryFn: () =>
      apiFetch<MapaAcomodacaoResponse>(`/api/v1/eventos/${eventoId}/mapa-acomodacao`),
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 5, // 5 minutes — offline grace for field operations
  })
}

// --------------- Local Mutations ---------------

export function useCreateLocal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LocalPayload) =>
      apiFetch<Local>('/api/v1/acomodacoes/locais', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
    },
  })
}

export function useUpdateLocal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LocalPayload> }) =>
      apiFetch<Local>(`/api/v1/acomodacoes/locais/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.local(id) })
    },
  })
}

// --------------- Quarto Mutations ---------------

export function useCreateQuarto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: QuartoPayload) =>
      apiFetch<Quarto>('/api/v1/acomodacoes/quartos', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { local_id }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.quartos(local_id) })
    },
  })
}

export function useUpdateQuarto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      local_id,
      payload,
    }: {
      id: string
      local_id: string
      payload: Partial<QuartoPayload>
    }) =>
      apiFetch<Quarto>(`/api/v1/acomodacoes/quartos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { local_id }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.quartos(local_id) })
    },
  })
}

// --------------- Cama Mutations ---------------

export function useCreateCama() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CamaPayload) =>
      apiFetch<Cama>('/api/v1/acomodacoes/camas', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { quarto_id }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.camas(quarto_id) })
    },
  })
}

export function useUpdateCama() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      quarto_id,
      payload,
    }: {
      id: string
      quarto_id: string
      payload: Partial<CamaPayload>
    }) =>
      apiFetch<Cama>(`/api/v1/acomodacoes/camas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { quarto_id }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.camas(quarto_id) })
    },
  })
}
