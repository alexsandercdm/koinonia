import { describe, expect, it, vi } from 'vitest'
import { RecordPagamentoUseCase } from './RecordPagamentoUseCase'

describe('RecordPagamentoUseCase', () => {
  it('deve persistir o usuario que registrou o pagamento no campo registrado_por', async () => {
    const pagamentoRepository = {
      create: vi.fn().mockResolvedValue({ id: 'pag-1' }),
      getSumByInscricaoId: vi.fn().mockResolvedValue(50),
    }

    const inscricaoRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'insc-1',
        status: 'PENDENTE',
        valor_total: '150.00',
      }),
      update: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new RecordPagamentoUseCase(pagamentoRepository as any, inscricaoRepository as any)

    await useCase.execute({
      inscricao_id: 'insc-1',
      valor: 50,
      forma_pagamento: 'PIX',
      usuario_registro_id: 'user-1',
      data_pagamento: '2026-04-01T12:00:00.000Z',
    })

    expect(pagamentoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inscricao_id: 'insc-1',
        valor: '50',
        forma_pagamento: 'PIX',
        registrado_por: 'user-1',
        data_pagamento: '2026-04-01T12:00:00.000Z',
      })
    )
  })

  it('deve bloquear pagamento para inscricao cancelada', async () => {
    const pagamentoRepository = {
      create: vi.fn(),
      getSumByInscricaoId: vi.fn(),
    }

    const inscricaoRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'insc-1',
        status: 'CANCELADA',
        valor_total: '150.00',
      }),
      update: vi.fn(),
    }

    const useCase = new RecordPagamentoUseCase(pagamentoRepository as any, inscricaoRepository as any)

    await expect(useCase.execute({
      inscricao_id: 'insc-1',
      valor: 50,
      forma_pagamento: 'PIX',
      usuario_registro_id: 'user-1',
    })).rejects.toThrow('Não é permitido registrar pagamento para inscrição cancelada')
  })
})
