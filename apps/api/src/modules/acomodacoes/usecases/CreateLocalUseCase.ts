import { CreateLocalDTO } from '@koinonia/shared'
import { DEFAULT_ORGANIZATION_ID } from '../../../db/default-organization'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  nome: string
  endereco?: string
  capacidade_total?: number
}

export class CreateLocalUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute(input: Input) {
    const payload = CreateLocalDTO.parse(input)
    return this.repository.createLocal({
      ...payload,
      organization_id: DEFAULT_ORGANIZATION_ID,
    })
  }
}
