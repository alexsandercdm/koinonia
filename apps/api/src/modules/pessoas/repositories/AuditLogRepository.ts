import { Database } from '../../../db'
import { auditLogs, CreateAuditLog } from '../../../db/schema'

export class AuditLogRepository {
  constructor(private db: Database) {}

  async logAction(data: CreateAuditLog) {
    const [log] = await this.db.insert(auditLogs).values(data).returning()
    return log
  }
}
