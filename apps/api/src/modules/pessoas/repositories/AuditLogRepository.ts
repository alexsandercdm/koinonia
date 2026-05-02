import { and, eq } from 'drizzle-orm'
import { type Database } from '../../../db'
import { auditLogs, pessoas, type CreateAuditLog } from '../../../db/schema'
import { BaseRepository } from '../../../lib/tenant/base-repository'
import type { TenantContext } from '../../../lib/tenant/types'

export class AuditLogRepository extends BaseRepository {
  constructor(db: Database, ctx: TenantContext) {
    super(db, ctx)
  }

  async logAction(data: CreateAuditLog) {
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
}
