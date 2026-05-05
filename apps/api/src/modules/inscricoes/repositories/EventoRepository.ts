import { and, count, eq, ne } from 'drizzle-orm'
import { type Database } from '../../../db'
import { type CreateConfiguracaoEvento, type CreateEvento, configuracaoEvento, eventos, inscricoes } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export class EventoRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async create(data: Omit<CreateEvento, 'organization_id'>) {
    const [evento] = await this.db.insert(eventos).values(this.withOrg(data)).returning()
    return evento
  }

  async addConfig(data: CreateConfiguracaoEvento) {
    await this.ensureEventoOwned(data.evento_id)

    const [config] = await this.db.insert(configuracaoEvento).values(data).returning()
    return config
  }

  async update(id: string, data: Partial<CreateEvento>) {
    const [evento] = await this.db
      .update(eventos)
      .set({ ...data, updated_at: new Date() })
      .where(and(this.whereOrg(eventos), eq(eventos.id, id)))
      .returning()

    return evento
  }

  async replaceConfigs(eventoId: string, configs: CreateConfiguracaoEvento[]) {
    await this.ensureEventoOwned(eventoId)

    await this.db.transaction(async (tx) => {
      await tx.delete(configuracaoEvento).where(eq(configuracaoEvento.evento_id, eventoId))

      if (configs.length > 0) {
        await tx.insert(configuracaoEvento).values(configs)
      }
    })
  }

  async findById(id: string) {
    return await this.db.query.eventos.findFirst({
      where: and(this.whereOrg(eventos), eq(eventos.id, id)),
      with: {
        configuracoes: true,
      },
    })
  }

  async list() {
    return await this.db.query.eventos.findMany({
      where: this.whereOrg(eventos),
      orderBy: (table, { desc }) => [desc(table.created_at)],
    })
  }

  async listWithStats() {
    const eventRows = await this.db.query.eventos.findMany({
      where: this.whereOrg(eventos),
      orderBy: (table, { desc }) => [desc(table.created_at)],
      with: {
        local: true,
        configuracoes: true,
      },
    })

    return await Promise.all(
      eventRows.map(async (evento) => {
        const [result] = await this.db
          .select({ value: count() })
          .from(inscricoes)
          .where(and(this.whereOrg(inscricoes), eq(inscricoes.evento_id, evento.id), ne(inscricoes.status, 'CANCELADA')))

        const inscritosCount = Number(result?.value ?? 0)
        const capacidadeMaxima = Number(evento.capacidade_maxima ?? 0)
        const ocupacaoPercentual =
          capacidadeMaxima <= 0
            ? 0
            : Math.min(100, Math.round((inscritosCount / capacidadeMaxima) * 100))

        const configs = evento.configuracoes ?? []
        const cfgEncontrista = configs.find((c) => c.papel === 'encontrista')
        const cfgServo = configs.find((c) => c.papel === 'servo')

        const { local: _local, configuracoes: _configs, ...eventoBase } = evento

        return {
          ...eventoBase,
          inscritos_count: inscritosCount,
          ocupacao_percentual: ocupacaoPercentual,
          local_nome: evento.local?.nome ?? null,
          preco_encontrista: cfgEncontrista ? Number(cfgEncontrista.valor) : null,
          preco_servo: cfgServo ? Number(cfgServo.valor) : null,
        }
      }),
    )
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
