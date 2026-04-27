import { and, count, eq, ne } from 'drizzle-orm'
import { Database } from '../../../db'
import { eventos, inscricoes, configuracaoEvento, CreateEvento, CreateConfiguracaoEvento } from '../../../db/schema'

export class EventoRepository {
  constructor(private db: Database) {}

  async create(data: CreateEvento) {
    const [evento] = await this.db.insert(eventos).values(data).returning()
    return evento
  }

  async addConfig(data: CreateConfiguracaoEvento) {
    const [config] = await this.db.insert(configuracaoEvento).values(data).returning()
    return config
  }

  async update(id: string, data: Partial<CreateEvento>) {
    const [evento] = await this.db
      .update(eventos)
      .set({ ...data, updated_at: new Date() })
      .where(eq(eventos.id, id))
      .returning()

    return evento
  }

  async replaceConfigs(eventoId: string, configs: CreateConfiguracaoEvento[]) {
    await this.db.transaction(async (tx) => {
      await tx.delete(configuracaoEvento).where(eq(configuracaoEvento.evento_id, eventoId))

      if (configs.length > 0) {
        await tx.insert(configuracaoEvento).values(configs)
      }
    })
  }

  async findById(id: string) {
    return await this.db.query.eventos.findFirst({
      where: eq(eventos.id, id),
      with: {
        configuracoes: true,
      },
    })
  }

  async list() {
    return await this.db.query.eventos.findMany({
      orderBy: (eventos, { desc }) => [desc(eventos.created_at)],
    })
  }

  async listWithStats() {
    const eventRows = await this.db.query.eventos.findMany({
      orderBy: (eventos, { desc }) => [desc(eventos.created_at)],
    })

    return await Promise.all(
      eventRows.map(async (evento) => {
        const [result] = await this.db
          .select({ value: count() })
          .from(inscricoes)
          .where(
            and(
              eq(inscricoes.evento_id, evento.id),
              ne(inscricoes.status, 'CANCELADA'),
            ),
          )

        return {
          ...evento,
          inscritos_count: result?.value ?? 0,
        }
      }),
    )
  }
}
