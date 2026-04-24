import { UpdateCamaDTO } from '@koinonia/shared'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  camaId: string
  identificacao?: string
  tipo?: 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal'
  bloqueada?: boolean
}

export class UpdateCamaUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ camaId, ...data }: Input) {
    const existing = await this.repository.findCamaById(camaId)
    if (!existing) {
      throw new AcomodacaoError('Cama não encontrada', 404)
    }

    const payload = UpdateCamaDTO.parse(data)
    return this.repository.updateCama(camaId, payload)
  }
}
