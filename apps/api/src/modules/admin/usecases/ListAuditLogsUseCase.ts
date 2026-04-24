import { Database } from '../../../db'
import { AuditLogRepository, ListAuditLogsParams } from '../repositories/AuditLogRepository'

export class ListAuditLogsUseCase {
  private repo: AuditLogRepository

  constructor(db: Database) {
    this.repo = new AuditLogRepository(db)
  }

  async execute(params: ListAuditLogsParams) {
    return this.repo.listPaginated(params)
  }
}
