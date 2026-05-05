import { and, desc, eq, type SQL } from 'drizzle-orm'
import { type Database } from '../../../db'
import { auditLogs, pessoas } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export interface ListAuditLogsParams {
  page: number
  limit: number
  action?: string
  userId?: string
}

export class AuditLogRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async insert(data: {
    user_id: string
    target_id: string
    action: string
    changes?: Record<string, unknown> | null
  }) {
    const target = await this.db.query.pessoas.findFirst({
      where: and(this.whereOrg(pessoas), eq(pessoas.id, data.target_id)),
      columns: { id: true },
    })

    if (!target) {
      throw new Error('Participante not found')
    }

    const [log] = await this.db.insert(auditLogs).values(data).returning()
    return log
  }

  async listPaginated(params: ListAuditLogsParams) {
    const { page, limit, action, userId } = params
    const offset = (page - 1) * limit

    const conditions: SQL[] = []
    if (action) conditions.push(eq(auditLogs.action, action))
    if (userId) conditions.push(eq(auditLogs.user_id, userId))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const rows = await this.db
      .select({ log: auditLogs })
      .from(auditLogs)
      .innerJoin(pessoas, eq(pessoas.id, auditLogs.target_id))
      .where(whereClause ? and(this.whereOrg(pessoas), whereClause) : this.whereOrg(pessoas))
      .orderBy(desc(auditLogs.created_at))
      .limit(limit)
      .offset(offset)

    return rows.map((row) => row.log)
  }
}
