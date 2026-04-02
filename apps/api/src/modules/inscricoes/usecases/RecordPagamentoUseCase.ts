import { PagamentoRepository } from '../repositories/PagamentoRepository'
import { InscricaoRepository } from '../repositories/InscricaoRepository'

interface RecordPagamentoRequest {
  inscricao_id: string
  valor: number
  forma_pagamento: string
  comprovante_url?: string
  usuario_registro_id: string
  data_pagamento?: string
}

export class RecordPagamentoUseCase {
  constructor(
    private pagamentoRepository: PagamentoRepository,
    private inscricaoRepository: InscricaoRepository
  ) {}

  async execute(request: RecordPagamentoRequest) {
    const { inscricao_id, valor, forma_pagamento, comprovante_url, usuario_registro_id, data_pagamento } = request

    // 1. Check if subscription exists
    const inscricao = await this.inscricaoRepository.findById(inscricao_id)
    if (!inscricao) {
      throw new Error('Inscrição não encontrada')
    }

    if (valor <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero')
    }

    if (inscricao.status === 'CANCELADA') {
      throw new Error('Não é permitido registrar pagamento para inscrição cancelada')
    }

    if (inscricao.status === 'PAGO_TOTAL') {
      throw new Error('Inscrição já está quitada')
    }

    // 2. Record the payment
    const pagamento = await this.pagamentoRepository.create({
      inscricao_id,
      valor: valor.toString(),
      forma_pagamento,
      comprovante_url,
      registrado_por: usuario_registro_id,
      data_pagamento: data_pagamento || new Date().toISOString(),
    } as any)

    // 3. Update status (Logic in Use Case)
    if (inscricao.status !== 'LISTA_ESPERA' && inscricao.status !== 'CANCELADA') {
      const totalPago = await this.pagamentoRepository.getSumByInscricaoId(inscricao_id)
      const valorTotal = parseFloat(inscricao.valor_total as string)
      
      let newStatus: 'PENDENTE' | 'PAGO_PARCIAL' | 'PAGO_TOTAL' = 'PENDENTE'
      
      if (totalPago >= valorTotal) {
        newStatus = 'PAGO_TOTAL'
      } else if (totalPago > 0) {
        newStatus = 'PAGO_PARCIAL'
      }
      
      if (newStatus !== inscricao.status) {
        await this.inscricaoRepository.update(inscricao_id, { status: newStatus })
      }
    }

    return pagamento
  }
}
