import { CreateQuartoDTO } from '@koinonia/shared'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  localId: string
  nome: string
  genero_permitido: 'M' | 'F' | 'MISTO'
  capacidade: number
}

export class CreateQuartoUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ localId, ...data }: Input) {
    const local = await this.repository.findLocalById(localId)
    if (!local) {
      throw new AcomodacaoError('Local não encontrado', 404)
    }

    const payload = CreateQuartoDTO.parse({ ...data, local_id: localId })
    return this.repository.createQuarto(payload)
  }
}
