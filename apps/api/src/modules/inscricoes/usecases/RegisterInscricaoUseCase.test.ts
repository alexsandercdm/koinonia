import { describe, expect, it, vi } from 'vitest'
import { RegisterInscricaoUseCase } from './RegisterInscricaoUseCase'

describe('RegisterInscricaoUseCase', () => {
  it('deve colocar a inscricao em lista de espera quando a capacidade ocupada for atingida', async () => {
    const inscricaoRepository = {
      findByEventoAndPessoa: vi.fn().mockResolvedValue(null),
      countByEventoId: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue({ id: 'insc-1', status: 'LISTA_ESPERA' }),
    }

    const eventoRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'evento-1',
        capacidade_maxima: 1,
        configuracoes: [{ papel: 'encontrista', valor: '150.00' }],
      }),
    }

    const useCase = new RegisterInscricaoUseCase(inscricaoRepository as any, eventoRepository as any)

    await useCase.execute({
      evento_id: 'evento-1',
      pessoa_id: 'pessoa-1',
      papel: 'encontrista',
    })

    expect(inscricaoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        evento_id: 'evento-1',
        pessoa_id: 'pessoa-1',
        papel: 'encontrista',
        valor_total: '150.00',
        status: 'LISTA_ESPERA',
      })
    )
  })

  it('deve bloquear inscricao duplicada para a mesma pessoa no evento', async () => {
    const inscricaoRepository = {
      findByEventoAndPessoa: vi.fn().mockResolvedValue({ id: 'insc-existing' }),
      countByEventoId: vi.fn(),
      create: vi.fn(),
    }

    const eventoRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'evento-1',
        capacidade_maxima: 10,
        configuracoes: [{ papel: 'encontrista', valor: '150.00' }],
      }),
    }

    const useCase = new RegisterInscricaoUseCase(inscricaoRepository as any, eventoRepository as any)

    await expect(useCase.execute({
      evento_id: 'evento-1',
      pessoa_id: 'pessoa-1',
      papel: 'encontrista',
    })).rejects.toThrow('Participante já possui inscrição para este evento')

    expect(inscricaoRepository.create).not.toHaveBeenCalled()
  })
})
