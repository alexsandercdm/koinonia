import { Database } from '../../../db'
import { FinanceiroRepository } from '../repositories/FinanceiroRepository'

export class ListDespesasUseCase {
  private repo: FinanceiroRepository

  constructor(db: Database) {
    this.repo = new FinanceiroRepository(db)
  }

  async execute(eventoId?: string) {
    return this.repo.listDespesas(eventoId)
  }
}
