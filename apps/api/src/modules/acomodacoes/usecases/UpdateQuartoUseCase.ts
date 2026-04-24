import { UpdateQuartoDTO } from '@koinonia/shared'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  quartoId: string
  nome?: string
  genero_permitido?: 'M' | 'F' | 'MISTO'
  capacidade?: number
}

export class UpdateQuartoUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ quartoId, ...data }: Input) {
    const existing = await this.repository.findQuartoById(quartoId)
    if (!existing) {
      throw new AcomodacaoError('Quarto não encontrado', 404)
    }

    const payload = UpdateQuartoDTO.parse(data)
    return this.repository.updateQuarto(quartoId, payload)
  }
}
