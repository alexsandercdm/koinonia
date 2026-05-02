import { CreateLocalDTO } from '@koinonia/shared'
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
    return this.repository.createLocal(payload)
  }
}
