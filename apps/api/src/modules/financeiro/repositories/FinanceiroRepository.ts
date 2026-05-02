import { and, eq, type SQL } from 'drizzle-orm'
import { type Database } from '../../../db'
import { type CreateDespesa, despesas, eventos, inscricoes, pagamentos } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export interface MetricasResult {
  totalArrecadado: number
  totalPrevisto: number
  totalDespesas: number
  breakEvenPct: number
  porStatus: Record<string, number>
}

export class FinanceiroRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async getMetricas(eventoId?: string): Promise<MetricasResult> {
    if (eventoId) {
      await this.ensureEventoOwned(eventoId)
    }

    const inscricoesWhere: SQL = eventoId
      ? and(this.whereOrg(inscricoes), eq(inscricoes.evento_id, eventoId))!
      : this.whereOrg(inscricoes)

    const pagamentosRows = await this.db
      .select({ valor: pagamentos.valor, eventoId: inscricoes.evento_id })
      .from(pagamentos)
      .innerJoin(inscricoes, eq(pagamentos.inscricao_id, inscricoes.id))
      .where(inscricoesWhere)

    const totalArrecadado = pagamentosRows.reduce((acc, row) => acc + parseFloat(row.valor ?? '0'), 0)

    const inscricoesRows = await this.db
      .select({ status: inscricoes.status, valor_total: inscricoes.valor_total })
      .from(inscricoes)
      .where(inscricoesWhere)

    const totalPrevisto = inscricoesRows
      .filter((row) => row.status !== 'CANCELADA' && row.status !== 'LISTA_ESPERA')
      .reduce((acc, row) => acc + parseFloat(row.valor_total ?? '0'), 0)

    const porStatus: Record<string, number> = {}
    for (const row of inscricoesRows) {
      porStatus[row.status ?? 'unknown'] = (porStatus[row.status ?? 'unknown'] ?? 0) + 1
    }

    const despesasRows = await this.db
      .select({ valor: despesas.valor })
      .from(despesas)
      .innerJoin(eventos, eq(eventos.id, despesas.evento_id))
      .where(eventoId ? and(this.whereOrg(eventos), eq(eventos.id, eventoId)) : this.whereOrg(eventos))

    const totalDespesas = despesasRows.reduce((acc, row) => acc + parseFloat(row.valor ?? '0'), 0)

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
    if (eventoId) {
      await this.ensureEventoOwned(eventoId)
    }

    const rows = await this.db
      .select({ despesa: despesas })
      .from(despesas)
      .innerJoin(eventos, eq(eventos.id, despesas.evento_id))
      .where(eventoId ? and(this.whereOrg(eventos), eq(eventos.id, eventoId)) : this.whereOrg(eventos))
      .orderBy(despesas.created_at)

    return rows.map((row) => row.despesa)
  }

  async createDespesa(data: CreateDespesa) {
    await this.ensureEventoOwned(data.evento_id)

    const [despesa] = await this.db.insert(despesas).values(data).returning()
    return despesa
  }

  private async ensureEventoOwned(eventoId: string) {
    const evento = await this.db.query.eventos.findFirst({
      where: and(this.whereOrg(eventos), eq(eventos.id, eventoId)),
      columns: { id: true },
    })

    if (!evento) {
      throw new Error('Evento não encontrado')
    }
  }
}
