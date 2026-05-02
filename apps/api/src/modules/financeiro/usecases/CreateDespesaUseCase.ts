import { FinanceiroRepository } from '../repositories/FinanceiroRepository'
import { CreateDespesa } from '../../../db/schema'

export class CreateDespesaUseCase {
  constructor(private repo: FinanceiroRepository) {}

  async execute(data: CreateDespesa) {
    return this.repo.createDespesa(data)
  }
}
