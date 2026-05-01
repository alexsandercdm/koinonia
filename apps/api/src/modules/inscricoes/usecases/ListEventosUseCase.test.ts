import { describe, expect, it, vi } from 'vitest'
import { ListEventosUseCase } from './ListEventosUseCase'

describe('ListEventosUseCase', () => {
  it('deve calcular ocupacao percentual dos eventos', async () => {
    const eventoRepository = {
      listWithStats: vi.fn().mockResolvedValue([
        {
          id: 'evento-1',
          nome: 'Evento vazio',
          capacidade_maxima: 100,
          inscritos_count: 0,
          status: 'rascunho',
        },
        {
          id: 'evento-2',
          nome: 'Evento parcial',
          capacidade_maxima: 100,
          inscritos_count: 75,
          status: 'aberto',
        },
        {
          id: 'evento-3',
          nome: 'Evento lotado',
          capacidade_maxima: 100,
          inscritos_count: 120,
          status: 'aberto',
        },
      ]),
    }

    const useCase = new ListEventosUseCase(eventoRepository as any)
    const result = await useCase.execute()

    expect(result).toEqual([
      expect.objectContaining({
        id: 'evento-1',
        inscritos_count: 0,
        ocupacao_percentual: 0,
      }),
      expect.objectContaining({
        id: 'evento-2',
        inscritos_count: 75,
        ocupacao_percentual: 75,
      }),
      expect.objectContaining({
        id: 'evento-3',
        inscritos_count: 120,
        ocupacao_percentual: 100,
      }),
    ])
  })
})
