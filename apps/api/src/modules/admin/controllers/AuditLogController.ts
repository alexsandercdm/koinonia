import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { AuditLogRepository } from '../repositories/AuditLogRepository'
import { ListAuditLogsUseCase } from '../usecases/ListAuditLogsUseCase'

export class AuditLogController {
  private buildUseCase(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    return new ListAuditLogsUseCase(new AuditLogRepository(db, ctx))
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as {
        page?: string
        limit?: string
        action?: string
        userId?: string
      }

      const page = Math.max(1, parseInt(query.page ?? '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))

      const logs = await this.buildUseCase(request, reply).execute({
        page,
        limit,
        action: query.action,
        userId: query.userId,
      })

      return reply.send({ data: logs, page, limit })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
