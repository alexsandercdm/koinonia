import { FastifyInstance } from 'fastify'
import { AuditLogController } from '../controllers/AuditLogController'
import { requireRole } from '../../../middleware/auth'

export async function adminRoutes(fastify: FastifyInstance) {
  const controller = new AuditLogController()

  const requireAdmin = { preHandler: [requireRole('admin')] }

  fastify.get('/admin/audit-logs', {
    ...requireAdmin,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          action: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
  }, controller.list.bind(controller))
}
