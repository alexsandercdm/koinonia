import { eq, sum } from 'drizzle-orm'
import { Database } from '../../../db'
import { pagamentos, CreatePagamento } from '../../../db/schema'

export class PagamentoRepository {
  constructor(private db: Database) {}

  async create(data: CreatePagamento) {
    const [pagamento] = await this.db.insert(pagamentos).values(data).returning()
    return pagamento
  }

  async findByInscricaoId(inscricaoId: string) {
    return await this.db.query.pagamentos.findMany({
      where: eq(pagamentos.inscricao_id, inscricaoId),
      orderBy: (pagamentos, { desc }) => [desc(pagamentos.data_pagamento)],
    })
  }

  async getSumByInscricaoId(inscricaoId: string) {
    const [result] = await this.db
      .select({ value: sum(pagamentos.valor) })
      .from(pagamentos)
      .where(eq(pagamentos.inscricao_id, inscricaoId))
    return parseFloat(result.value || '0')
  }

  async delete(id: string) {
    return await this.db.delete(pagamentos).where(eq(pagamentos.id, id)).returning()
  }
}
