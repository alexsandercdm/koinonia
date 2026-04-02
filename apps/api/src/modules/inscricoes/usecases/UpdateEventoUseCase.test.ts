import { describe, expect, it, vi } from 'vitest'
import { UpdateEventoUseCase } from './UpdateEventoUseCase'

describe('UpdateEventoUseCase', () => {
  it('deve atualizar os dados do evento e substituir configuracoes', async () => {
    const eventoRepository = {
      findById: vi.fn()
        .mockResolvedValueOnce({
          id: 'evento-1',
          nome: 'Retiro Antigo',
          descricao: 'Descricao antiga',
          data_inicio: '2026-04-10',
          data_fim: '2026-04-12',
          capacidade_maxima: 100,
          local_id: null,
          status: 'rascunho',
          configuracoes: [{ papel: 'encontrista', valor: '150.00' }],
        })
        .mockResolvedValueOnce({
          id: 'evento-1',
          nome: 'Retiro Novo',
          descricao: 'Descricao nova',
          data_inicio: '2026-04-11',
          data_fim: '2026-04-13',
          capacidade_maxima: 120,
          local_id: null,
          status: 'aberto',
          configuracoes: [
            { papel: 'encontrista', valor: '180.00' },
            { papel: 'servo', valor: '90.00' },
          ],
        }),
      update: vi.fn().mockResolvedValue(undefined),
      replaceConfigs: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new UpdateEventoUseCase(eventoRepository as any)
    const result = await useCase.execute({
      id: 'evento-1',
      nome: 'Retiro Novo',
      descricao: 'Descricao nova',
      data_inicio: '2026-04-11T00:00:00.000Z',
      data_fim: '2026-04-13T00:00:00.000Z',
      capacidade_maxima: 120,
      status: 'aberto',
      configuracoes: [
        { papel: 'encontrista', valor: 180 },
        { papel: 'servo', valor: 90 },
      ],
    })

    expect(eventoRepository.update).toHaveBeenCalledWith(
      'evento-1',
      expect.objectContaining({
        nome: 'Retiro Novo',
        descricao: 'Descricao nova',
        capacidade_maxima: 120,
        status: 'aberto',
      })
    )

    expect(eventoRepository.replaceConfigs).toHaveBeenCalledWith('evento-1', [
      { evento_id: 'evento-1', papel: 'encontrista', valor: '180' },
      { evento_id: 'evento-1', papel: 'servo', valor: '90' },
    ])

    expect(result).toEqual(expect.objectContaining({
      id: 'evento-1',
      nome: 'Retiro Novo',
      status: 'aberto',
    }))
  })
})
