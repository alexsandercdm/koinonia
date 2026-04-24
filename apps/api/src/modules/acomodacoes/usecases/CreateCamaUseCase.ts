import { CreateCamaDTO } from '@koinonia/shared'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  quartoId: string
  identificacao: string
  tipo: 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal'
  bloqueada?: boolean
}

export class CreateCamaUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ quartoId, ...data }: Input) {
    const quarto = await this.repository.findQuartoById(quartoId)
    if (!quarto) {
      throw new AcomodacaoError('Quarto não encontrado', 404)
    }

    const payload = CreateCamaDTO.parse({ ...data, quarto_id: quartoId })
    return this.repository.createCama(payload)
  }
}
