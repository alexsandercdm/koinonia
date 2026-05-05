import { and, eq, sum } from 'drizzle-orm'
import { type Database } from '../../../db'
import { type CreatePagamento, inscricoes, pagamentos } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export class PagamentoRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async create(data: CreatePagamento) {
    await this.ensureInscricaoOwned(data.inscricao_id)

    const [pagamento] = await this.db.insert(pagamentos).values(data).returning()
    return pagamento
  }

  async findByInscricaoId(inscricaoId: string) {
    await this.ensureInscricaoOwned(inscricaoId)

    return await this.db.query.pagamentos.findMany({
      where: eq(pagamentos.inscricao_id, inscricaoId),
      orderBy: (table, { desc }) => [desc(table.data_pagamento)],
    })
  }

  async getSumByInscricaoId(inscricaoId: string) {
    await this.ensureInscricaoOwned(inscricaoId)

    const [result] = await this.db
      .select({ value: sum(pagamentos.valor) })
      .from(pagamentos)
      .where(eq(pagamentos.inscricao_id, inscricaoId))
    return parseFloat(result.value || '0')
  }

  async delete(id: string) {
    const pagamento = await this.db
      .select({ id: pagamentos.id })
      .from(pagamentos)
      .innerJoin(inscricoes, eq(inscricoes.id, pagamentos.inscricao_id))
      .where(and(eq(pagamentos.id, id), this.whereOrg(inscricoes)))
      .limit(1)

    if (pagamento.length === 0) {
      return []
    }

    return await this.db.delete(pagamentos).where(eq(pagamentos.id, id)).returning()
  }

  private async ensureInscricaoOwned(inscricaoId: string) {
    const inscricao = await this.db.query.inscricoes.findFirst({
      where: and(this.whereOrg(inscricoes), eq(inscricoes.id, inscricaoId)),
      columns: { id: true },
    })

    if (!inscricao) {
      throw new Error('Inscrição não encontrada')
    }
  }
}
