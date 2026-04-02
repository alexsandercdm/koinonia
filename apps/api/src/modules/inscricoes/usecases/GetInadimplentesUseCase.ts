import { InscricaoRepository } from '../repositories/InscricaoRepository'
import { PagamentoRepository } from '../repositories/PagamentoRepository'

interface InadimplenteResponse {
  inscricao_id: string
  nome: string
  telefone?: string
  valor_total: number
  valor_pago: number
  saldo_devedor: number
  status: string
}

export class GetInadimplentesUseCase {
  constructor(
    private inscricaoRepository: InscricaoRepository,
    private pagamentoRepository: PagamentoRepository
  ) {}

  async execute(eventoId: string) {
    // 1. Get all subscriptions for the event
    const inscricoes = await this.inscricaoRepository.findByEventoId(eventoId)

    // 2. Filter and calculate balance
    const inadimplentes: InadimplenteResponse[] = []

    for (const inscricao of inscricoes) {
      if (inscricao.status === 'PENDENTE' || inscricao.status === 'PAGO_PARCIAL') {
        const totalPago = await this.pagamentoRepository.getSumByInscricaoId(inscricao.id)
        const valorTotal = parseFloat(inscricao.valor_total as string)
        const saldoDevedor = valorTotal - totalPago

        if (saldoDevedor > 0) {
          inadimplentes.push({
            inscricao_id: inscricao.id,
            nome: (inscricao.pessoa as any).nome,
            telefone: (inscricao.pessoa as any).telefone,
            valor_total: valorTotal,
            valor_pago: totalPago,
            saldo_devedor: saldoDevedor,
            status: inscricao.status,
          })
        }
      }
    }

    return inadimplentes
  }
}
