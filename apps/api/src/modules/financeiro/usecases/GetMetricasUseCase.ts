import { FinanceiroRepository } from '../repositories/FinanceiroRepository'

export class GetMetricasUseCase {
  constructor(private repo: FinanceiroRepository) {}

  async execute(eventoId?: string) {
    return this.repo.getMetricas(eventoId)
  }
}
