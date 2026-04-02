import { InscricaoRepository } from '../repositories/InscricaoRepository'
import { PagamentoRepository } from '../repositories/PagamentoRepository'

interface CancelInscricaoRequest {
  inscricao_id: string
  refund_amount?: number
  forma_estorno?: string
  usuario_registro_id: string
}

export class CancelInscricaoUseCase {
  constructor(
    private inscricaoRepository: InscricaoRepository,
    private pagamentoRepository: PagamentoRepository
  ) {}

  async execute(request: CancelInscricaoRequest) {
    const { inscricao_id, refund_amount, forma_estorno, usuario_registro_id } = request

    // 1. Get the subscription
    const inscricao = await this.inscricaoRepository.findById(inscricao_id)
    if (!inscricao) {
      throw new Error('Inscrição não encontrada')
    }

    if (inscricao.status === 'CANCELADA') {
      throw new Error('Inscrição já está cancelada')
    }

    if (refund_amount !== undefined && refund_amount < 0) {
      throw new Error('Valor do estorno não pode ser negativo')
    }

    const totalPago = await this.pagamentoRepository.getSumByInscricaoId(inscricao_id)
    if ((refund_amount || 0) > totalPago) {
      throw new Error('Valor do estorno não pode ser maior que o total pago')
    }

    // 2. Perform the cancellation
    await this.inscricaoRepository.update(inscricao_id, {
      status: 'CANCELADA',
    })

    // 3. Record the refund if specified
    if (refund_amount && refund_amount > 0) {
      await this.pagamentoRepository.create({
        inscricao_id,
        valor: (-refund_amount).toString(), // Negative valor for refund
        forma_pagamento: forma_estorno || 'estorno',
        data_pagamento: new Date().toISOString(),
        registrado_por: usuario_registro_id,
      } as any)
    }

    return await this.inscricaoRepository.findById(inscricao_id)
  }
}
