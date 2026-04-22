import { eq, sum, count, and, SQL } from 'drizzle-orm'
import { Database } from '../../../db'
import { inscricoes, pagamentos, despesas, configuracaoEvento, CreateDespesa } from '../../../db/schema'

export interface MetricasResult {
  totalArrecadado: number
  totalPrevisto: number
  totalDespesas: number
  breakEvenPct: number
  porStatus: Record<string, number>
}

export class FinanceiroRepository {
  constructor(private db: Database) {}

  async getMetricas(eventoId?: string): Promise<MetricasResult> {
    // Total arrecadado = soma dos pagamentos
    const pagamentosWhere: SQL | undefined = eventoId
      ? eq(inscricoes.evento_id, eventoId)
      : undefined

    // Sum pagamentos via join inscricoes
    const pagamentosRows = await this.db
      .select({ valor: pagamentos.valor, eventoId: inscricoes.evento_id })
      .from(pagamentos)
      .innerJoin(inscricoes, eq(pagamentos.inscricao_id, inscricoes.id))
      .where(pagamentosWhere)

    const totalArrecadado = pagamentosRows.reduce(
      (acc, r) => acc + parseFloat(r.valor ?? '0'),
      0,
    )

    // Total previsto = soma valor_total das inscrições ativas
    const inscricoesWhere: SQL | undefined = eventoId
      ? and(
          eq(inscricoes.evento_id, eventoId),
          // exclude cancelled
        )
      : undefined

    const inscricoesRows = await this.db
      .select({ status: inscricoes.status, valor_total: inscricoes.valor_total })
      .from(inscricoes)
      .where(inscricoesWhere)

    const totalPrevisto = inscricoesRows
      .filter((r) => r.status !== 'CANCELADA' && r.status !== 'LISTA_ESPERA')
      .reduce((acc, r) => acc + parseFloat(r.valor_total ?? '0'), 0)

    // porStatus
    const porStatus: Record<string, number> = {}
    for (const row of inscricoesRows) {
      porStatus[row.status ?? 'unknown'] = (porStatus[row.status ?? 'unknown'] ?? 0) + 1
    }

    // Total despesas
    const despesasWhere: SQL | undefined = eventoId
      ? eq(despesas.evento_id, eventoId)
      : undefined

    const despesasRows = await this.db
      .select({ valor: despesas.valor })
      .from(despesas)
      .where(despesasWhere)

    const totalDespesas = despesasRows.reduce(
      (acc, r) => acc + parseFloat(r.valor ?? '0'),
      0,
    )

    const breakEvenPct =
      totalDespesas > 0 ? Math.min(100, (totalArrecadado / totalDespesas) * 100) : 100

    return {
      totalArrecadado,
      totalPrevisto,
      totalDespesas,
      breakEvenPct,
      porStatus,
    }
  }

  async listDespesas(eventoId?: string) {
    const whereClause: SQL | undefined = eventoId
      ? eq(despesas.evento_id, eventoId)
      : undefined

    return this.db.select().from(despesas).where(whereClause).orderBy(despesas.created_at)
  }

  async createDespesa(data: CreateDespesa) {
    const [despesa] = await this.db.insert(despesas).values(data).returning()
    return despesa
  }
}
