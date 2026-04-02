import { describe, expect, it, vi } from 'vitest'
import { GetInadimplentesUseCase } from './GetInadimplentesUseCase'

describe('GetInadimplentesUseCase', () => {
  it('deve listar apenas inscricoes pendentes ou parciais com saldo devedor', async () => {
    const inscricaoRepository = {
      findByEventoId: vi.fn().mockResolvedValue([
        {
          id: 'insc-1',
          status: 'PENDENTE',
          valor_total: '150.00',
          pessoa: { nome: 'Pessoa 1', telefone: '1111' },
        },
        {
          id: 'insc-2',
          status: 'LISTA_ESPERA',
          valor_total: '150.00',
          pessoa: { nome: 'Pessoa 2', telefone: '2222' },
        },
        {
          id: 'insc-3',
          status: 'CANCELADA',
          valor_total: '150.00',
          pessoa: { nome: 'Pessoa 3', telefone: '3333' },
        },
      ]),
    }

    const pagamentoRepository = {
      getSumByInscricaoId: vi.fn().mockImplementation(async (id: string) => {
        if (id === 'insc-1') return 50
        return 0
      }),
    }

    const useCase = new GetInadimplentesUseCase(inscricaoRepository as any, pagamentoRepository as any)
    const result = await useCase.execute('evento-1')

    expect(result).toEqual([
      {
        inscricao_id: 'insc-1',
        nome: 'Pessoa 1',
        telefone: '1111',
        valor_total: 150,
        valor_pago: 50,
        saldo_devedor: 100,
        status: 'PENDENTE',
      },
    ])
  })
})
