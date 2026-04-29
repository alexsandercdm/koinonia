import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Local, Quarto, Cama, MapaAcomodacao, InscricaoDisponivel } from '@koinonia/shared'
export { useEventos } from './use-eventos'
export type { EventoListItem } from '@koinonia/shared'

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

// Nota: MapaAcomodacaoResponse foi removido — usar MapaAcomodacao do @koinonia/shared
// O tipo do shared tem a estrutura correta: { evento, local, quartos[] }

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
      apiFetch<MapaAcomodacao>(`/api/v1/eventos/${eventoId}/mapa-acomodacao`),
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
    mutationFn: ({ localId, payload }: { localId: string; payload: Omit<QuartoPayload, 'local_id'> }) =>
      apiFetch<Quarto>(`/api/v1/acomodacoes/locais/${localId}/quartos`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
    },
  })
}

export function useUpdateQuarto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      localId: _localId,
      payload,
    }: {
      id: string
      localId: string
      payload: Partial<Omit<QuartoPayload, 'local_id'>>
    }) =>
      apiFetch<Quarto>(`/api/v1/acomodacoes/quartos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { localId: _localId }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
    },
  })
}

// --------------- Candidatos sem cama ---------------

// Nota: InscricaoSemCama foi removido — usar InscricaoDisponivel do @koinonia/shared
// O tipo do shared tem os campos corretos: { id, nome, genero, papel, status }

export const inscricoesSemCamaKeys = {
  list: (eventoId: string, q?: string) =>
    ['inscricoes-sem-cama', eventoId, q ?? ''] as const,
}

export function useInscricoesSemCama(eventoId: string, q: string, enabled = true) {
  return useQuery({
    queryKey: inscricoesSemCamaKeys.list(eventoId, q),
    queryFn: () => {
      const params = q ? `?q=${encodeURIComponent(q)}` : ''
      return apiFetch<InscricaoDisponivel[]>(
        `/api/v1/eventos/${eventoId}/inscricoes-sem-cama${params}`
      )
    },
    enabled: enabled && !!eventoId,
    staleTime: 0,
  })
}

// --------------- Atribuir / Liberar cama ---------------

export function useAtribuirCama(eventoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      camaId,
      inscricaoId,
    }: {
      camaId: string
      inscricaoId: string
    }) =>
      apiFetch<void>(`/api/v1/acomodacoes/camas/${camaId}/atribuir`, {
        method: 'POST',
        body: JSON.stringify({ inscricao_id: inscricaoId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.mapa(eventoId) })
      queryClient.invalidateQueries({ queryKey: inscricoesSemCamaKeys.list(eventoId) })
    },
  })
}

export function useLiberarCama(eventoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ camaId }: { camaId: string }) =>
      apiFetch<void>(`/api/v1/acomodacoes/camas/${camaId}/atribuir`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.mapa(eventoId) })
      queryClient.invalidateQueries({ queryKey: inscricoesSemCamaKeys.list(eventoId) })
    },
  })
}

// --------------- Quarto Delete ---------------

export function useDeleteQuarto(localId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quartoId: string) =>
      apiFetch<void>(`/api/v1/acomodacoes/quartos/${quartoId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.quartos(localId) })
    },
  })
}

// --------------- Cama Mutations ---------------

export function useCreateCama() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ quartoId, payload }: { quartoId: string; payload: Omit<CamaPayload, 'quarto_id'> }) =>
      apiFetch<Cama>(`/api/v1/acomodacoes/quartos/${quartoId}/camas`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
    },
  })
}

export function useUpdateCama() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      quartoId: _quartoId,
      payload,
    }: {
      id: string
      quartoId: string
      payload: Partial<Omit<CamaPayload, 'quarto_id'>>
    }) =>
      apiFetch<Cama>(`/api/v1/acomodacoes/camas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, { quartoId: _quartoId }) => {
      queryClient.invalidateQueries({ queryKey: acomodacoesKeys.locais() })
    },
  })
}
