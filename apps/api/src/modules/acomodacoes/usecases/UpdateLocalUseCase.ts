import { UpdateLocalDTO } from '@koinonia/shared'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  localId: string
  nome?: string
  endereco?: string
  capacidade_total?: number
}

export class UpdateLocalUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ localId, ...data }: Input) {
    const existing = await this.repository.findLocalById(localId)
    if (!existing) {
      throw new AcomodacaoError('Local não encontrado', 404)
    }

    const payload = UpdateLocalDTO.parse(data)
    return this.repository.updateLocal(localId, payload)
  }
}
