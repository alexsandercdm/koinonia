import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

export class ListLocaisEstruturaUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute() {
    return this.repository.listLocaisWithStructure()
  }
}
