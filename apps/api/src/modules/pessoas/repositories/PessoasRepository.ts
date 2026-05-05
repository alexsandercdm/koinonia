import { and, eq, ilike, isNull, ne, sql, type SQL } from 'drizzle-orm'
import { type Database } from '../../../db'
import { eventos, inscricoes, pessoas } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export class PessoasRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async list(opts: { q?: string; page: number; pageSize: number }) {
    const { q, page, pageSize } = opts
    const offset = (page - 1) * pageSize
    const conditions: SQL[] = [this.whereOrg(pessoas), isNull(pessoas.deleted_at)]

    if (q) {
      conditions.push(ilike(pessoas.nome, `%${q}%`))
    }

    const whereClause = conditions.length > 1 ? and(...conditions)! : conditions[0]

    const [data, all] = await Promise.all([
      this.db.select().from(pessoas).where(whereClause).limit(pageSize).offset(offset).orderBy(pessoas.nome),
      this.db.select({ id: pessoas.id }).from(pessoas).where(whereClause),
    ])

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: all.length,
        totalPages: Math.ceil(all.length / pageSize),
      },
    }
  }

  async findById(id: string) {
    return this.db.query.pessoas.findFirst({
      where: and(this.whereOrg(pessoas), eq(pessoas.id, id), isNull(pessoas.deleted_at)),
    })
  }

  async findByEmail(email: string, excludeId?: string) {
    const conditions: SQL[] = [this.whereOrg(pessoas), eq(pessoas.email, email), isNull(pessoas.deleted_at)]

    if (excludeId) {
      conditions.push(ne(pessoas.id, excludeId))
    }

    return this.db.query.pessoas.findFirst({
      where: and(...conditions)!,
    })
  }

  async findByPhone(phone: string, excludeId?: string) {
    const conditions: SQL[] = [this.whereOrg(pessoas), eq(pessoas.telefone, phone), isNull(pessoas.deleted_at)]

    if (excludeId) {
      conditions.push(ne(pessoas.id, excludeId))
    }

    return this.db.query.pessoas.findFirst({
      where: and(...conditions)!,
    })
  }

  async create(data: Omit<typeof pessoas.$inferInsert, 'organization_id'>) {
    const [row] = await this.db.insert(pessoas).values(this.withOrg(data)).returning()
    return row
  }

  async update(id: string, data: Partial<typeof pessoas.$inferInsert>) {
    const [row] = await this.db
      .update(pessoas)
      .set({ ...data, updated_at: new Date() })
      .where(and(this.whereOrg(pessoas), eq(pessoas.id, id), isNull(pessoas.deleted_at)))
      .returning()

    return row
  }

  async softDelete(id: string) {
    const [row] = await this.db
      .update(pessoas)
      .set({ deleted_at: new Date() })
      .where(and(this.whereOrg(pessoas), eq(pessoas.id, id), isNull(pessoas.deleted_at)))
      .returning()

    return row
  }

  async getHistorico(pessoaId: string) {
    return this.db
      .select({
        evento: eventos,
        inscricao: inscricoes,
      })
      .from(inscricoes)
      .innerJoin(eventos, eq(inscricoes.evento_id, eventos.id))
      .where(and(this.whereOrg(inscricoes), eq(inscricoes.pessoa_id, pessoaId), this.whereOrg(eventos)))
      .orderBy(eventos.data_inicio)
  }

  async findSubtree(pessoaId: string, maxDepth = 10): Promise<typeof pessoas.$inferSelect[]> {
    const rows = await this.db.execute(sql`
      WITH RECURSIVE rede AS (
        SELECT p.id, p.lider_pessoa_id, 1 AS depth
        FROM pessoas p
        WHERE p.id = ${pessoaId}
          AND p.organization_id = ${this.orgId}
          AND p.deleted_at IS NULL

        UNION ALL

        SELECT p.id, p.lider_pessoa_id, r.depth + 1
        FROM pessoas p
        INNER JOIN rede r ON p.lider_pessoa_id = r.id
        WHERE p.organization_id = ${this.orgId}
          AND p.deleted_at IS NULL
          AND r.depth < ${maxDepth}
      )
      SELECT p.*
      FROM pessoas p
      WHERE p.id IN (SELECT id FROM rede)
        AND p.organization_id = ${this.orgId}
    `)

    return rows as unknown as typeof pessoas.$inferSelect[]
  }

  async findDirectChildren(pessoaId: string) {
    return this.db
      .select()
      .from(pessoas)
      .where(and(this.whereOrg(pessoas), eq(pessoas.lider_pessoa_id, pessoaId), isNull(pessoas.deleted_at)))
  }
}
