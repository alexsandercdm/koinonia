import { and, count, eq, ne } from 'drizzle-orm'
import { Database } from '../../../db'
import { inscricoes, CreateInscricao } from '../../../db/schema'

export class InscricaoRepository {
  constructor(private db: Database) {}

  async create(data: CreateInscricao) {
    const [inscricao] = await this.db.insert(inscricoes).values(data).returning()
    return inscricao
  }

  async findById(id: string) {
    return await this.db.query.inscricoes.findFirst({
      where: eq(inscricoes.id, id),
      with: {
        pessoa: true,
        evento: true,
        pagamentos: true,
      },
    })
  }

  async update(id: string, data: Partial<CreateInscricao>) {
    const [inscricao] = await this.db
      .update(inscricoes)
      .set({ ...data, updated_at: new Date() })
      .where(eq(inscricoes.id, id))
      .returning()
    return inscricao
  }

  async countByEventoId(eventoId: string) {
    const [result] = await this.db
      .select({ value: count() })
      .from(inscricoes)
      .where(
        and(
          eq(inscricoes.evento_id, eventoId),
          ne(inscricoes.status, 'CANCELADA'),
          ne(inscricoes.status, 'LISTA_ESPERA'),
        )
      )
    return result.value || 0
  }

  async findByEventoId(eventoId: string) {
    return await this.db.query.inscricoes.findMany({
      where: eq(inscricoes.evento_id, eventoId),
      with: {
        pessoa: true,
      },
    })
  }

  async findByEventoAndPessoa(eventoId: string, pessoaId: string) {
    return await this.db.query.inscricoes.findFirst({
      where: and(
        eq(inscricoes.evento_id, eventoId),
        eq(inscricoes.pessoa_id, pessoaId),
      ),
    })
  }
}
