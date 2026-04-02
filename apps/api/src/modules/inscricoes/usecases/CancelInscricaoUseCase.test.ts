import { describe, expect, it, vi } from 'vitest'
import { CancelInscricaoUseCase } from './CancelInscricaoUseCase'

describe('CancelInscricaoUseCase', () => {
  it('deve registrar o estorno com registrado_por', async () => {
    const inscricaoRepository = {
      findById: vi.fn()
        .mockResolvedValueOnce({ id: 'insc-1', status: 'PAGO_PARCIAL' })
        .mockResolvedValueOnce({ id: 'insc-1', status: 'CANCELADA' }),
      update: vi.fn().mockResolvedValue(undefined),
    }

    const pagamentoRepository = {
      getSumByInscricaoId: vi.fn().mockResolvedValue(80),
      create: vi.fn().mockResolvedValue({ id: 'pag-estorno' }),
    }

    const useCase = new CancelInscricaoUseCase(inscricaoRepository as any, pagamentoRepository as any)

    await useCase.execute({
      inscricao_id: 'insc-1',
      refund_amount: 50,
      forma_estorno: 'PIX',
      usuario_registro_id: 'user-1',
    })

    expect(pagamentoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inscricao_id: 'insc-1',
        valor: '-50',
        forma_pagamento: 'PIX',
        registrado_por: 'user-1',
      })
    )
  })

  it('deve bloquear estorno maior que o total pago', async () => {
    const inscricaoRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'insc-1', status: 'PAGO_PARCIAL' }),
      update: vi.fn(),
    }

    const pagamentoRepository = {
      getSumByInscricaoId: vi.fn().mockResolvedValue(30),
      create: vi.fn(),
    }

    const useCase = new CancelInscricaoUseCase(inscricaoRepository as any, pagamentoRepository as any)

    await expect(useCase.execute({
      inscricao_id: 'insc-1',
      refund_amount: 50,
      usuario_registro_id: 'user-1',
    })).rejects.toThrow('Valor do estorno não pode ser maior que o total pago')
  })
})
