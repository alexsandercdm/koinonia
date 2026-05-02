import { and, count, eq, ne } from 'drizzle-orm'
import { type Database } from '../../../db'
import { type CreateInscricao, inscricoes } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export class InscricaoRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async create(data: Omit<CreateInscricao, 'organization_id'>) {
    const [inscricao] = await this.db.insert(inscricoes).values(this.withOrg(data)).returning()
    return inscricao
  }

  async findById(id: string) {
    return await this.db.query.inscricoes.findFirst({
      where: and(this.whereOrg(inscricoes), eq(inscricoes.id, id)),
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
      .where(and(this.whereOrg(inscricoes), eq(inscricoes.id, id)))
      .returning()
    return inscricao
  }

  async countByEventoId(eventoId: string) {
    const [result] = await this.db
      .select({ value: count() })
      .from(inscricoes)
      .where(and(this.whereOrg(inscricoes), eq(inscricoes.evento_id, eventoId), ne(inscricoes.status, 'CANCELADA'), ne(inscricoes.status, 'LISTA_ESPERA')))
    return result.value || 0
  }

  async findByEventoId(eventoId: string) {
    return await this.db.query.inscricoes.findMany({
      where: and(this.whereOrg(inscricoes), eq(inscricoes.evento_id, eventoId)),
      with: {
        pessoa: true,
      },
    })
  }

  async findByEventoAndPessoa(eventoId: string, pessoaId: string) {
    return await this.db.query.inscricoes.findFirst({
      where: and(this.whereOrg(inscricoes), eq(inscricoes.evento_id, eventoId), eq(inscricoes.pessoa_id, pessoaId)),
    })
  }
}
