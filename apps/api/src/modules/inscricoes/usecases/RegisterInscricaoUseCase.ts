import { InscricaoRepository } from '../repositories/InscricaoRepository'
import { EventoRepository } from '../repositories/EventoRepository'
import { CreateInscricao } from '../../../db/schema'

interface RegisterInscricaoRequest {
  evento_id: string
  pessoa_id: string
  papel: 'encontrista' | 'servo'
  observacoes?: string
}

export class RegisterInscricaoUseCase {
  constructor(
    private inscricaoRepository: InscricaoRepository,
    private eventoRepository: EventoRepository
  ) {}

  async execute(request: RegisterInscricaoRequest) {
    const { evento_id, pessoa_id, papel, observacoes } = request

    // 1. Get Event and Pricing
    const evento = await this.eventoRepository.findById(evento_id)
    if (!evento) {
      throw new Error('Evento não encontrado')
    }

    const config = evento.configuracoes.find(c => c.papel === papel)
    if (!config) {
      throw new Error(`Preço não configurado para o papel: ${papel}`)
    }

    const existingInscricao = await this.inscricaoRepository.findByEventoAndPessoa(evento_id, pessoa_id)
    if (existingInscricao) {
      throw new Error('Participante já possui inscrição para este evento')
    }

    // 2. Check Capacity
    const currentTotal = await this.inscricaoRepository.countByEventoId(evento_id)
    const status = currentTotal >= evento.capacidade_maxima ? 'LISTA_ESPERA' : 'PENDENTE'

    // 3. Create Subscription
    const inscricao = await this.inscricaoRepository.create({
      evento_id,
      pessoa_id,
      papel,
      valor_total: config.valor,
      status,
      observacoes,
    } as CreateInscricao)

    return inscricao
  }
}
