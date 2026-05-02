import { FinanceiroRepository } from '../repositories/FinanceiroRepository'

export class ListDespesasUseCase {
  constructor(private repo: FinanceiroRepository) {}

  async execute(eventoId?: string) {
    return this.repo.listDespesas(eventoId)
  }
}
