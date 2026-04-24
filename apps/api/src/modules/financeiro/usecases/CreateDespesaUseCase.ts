import { Database } from '../../../db'
import { FinanceiroRepository } from '../repositories/FinanceiroRepository'
import { CreateDespesa } from '../../../db/schema'

export class CreateDespesaUseCase {
  private repo: FinanceiroRepository

  constructor(db: Database) {
    this.repo = new FinanceiroRepository(db)
  }

  async execute(data: CreateDespesa) {
    return this.repo.createDespesa(data)
  }
}
