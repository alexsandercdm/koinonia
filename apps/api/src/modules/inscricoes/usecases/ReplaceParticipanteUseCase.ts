import { InscricaoRepository } from '../repositories/InscricaoRepository'

interface ReplaceParticipanteRequest {
  inscricao_id: string
  new_pessoa_id: string
}

export class ReplaceParticipanteUseCase {
  constructor(private inscricaoRepository: InscricaoRepository) {}

  async execute(request: ReplaceParticipanteRequest) {
    const { inscricao_id, new_pessoa_id } = request

    // 1. Check if subscription exists
    const inscricao = await this.inscricaoRepository.findById(inscricao_id)
    if (!inscricao) {
      throw new Error('Inscrição não encontrada')
    }

    const existingInscricao = await this.inscricaoRepository.findByEventoAndPessoa(inscricao.evento_id, new_pessoa_id)
    if (existingInscricao && existingInscricao.id !== inscricao_id) {
      throw new Error('Novo participante já possui inscrição para este evento')
    }

    // 2. Perform the swap
    // The history of payments remains linked to the subscription, 
    // but the person changes.
    return await this.inscricaoRepository.update(inscricao_id, {
      pessoa_id: new_pessoa_id,
    })
  }
}
