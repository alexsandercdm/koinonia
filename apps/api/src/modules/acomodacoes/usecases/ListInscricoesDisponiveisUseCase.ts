import { InscricaoDisponivelSchema } from '@koinonia/shared'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  eventoId: string
  query?: string
}

export class ListInscricoesDisponiveisUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ eventoId, query }: Input) {
    const inscricoes = await this.repository.listInscricoesDisponiveis(eventoId, query)
    return inscricoes.map((inscricao) => InscricaoDisponivelSchema.parse(inscricao))
  }
}
