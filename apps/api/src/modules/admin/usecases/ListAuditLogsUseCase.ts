import { AuditLogRepository, ListAuditLogsParams } from '../repositories/AuditLogRepository'

export class ListAuditLogsUseCase {
  constructor(private repo: AuditLogRepository) {}

  async execute(params: ListAuditLogsParams) {
    return this.repo.listPaginated(params)
  }
}
