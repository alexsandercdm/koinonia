import { desc, eq, and, SQL } from 'drizzle-orm'
import { Database } from '../../../db'
import { auditLogs } from '../../../db/schema'

export interface ListAuditLogsParams {
  page: number
  limit: number
  action?: string
  userId?: string
}

export class AuditLogRepository {
  constructor(private db: Database) {}

  async insert(data: {
    user_id: string
    target_id: string
    action: string
    changes?: Record<string, unknown> | null
  }) {
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
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.created_at))
      .limit(limit)
      .offset(offset)

    return rows
  }
}
