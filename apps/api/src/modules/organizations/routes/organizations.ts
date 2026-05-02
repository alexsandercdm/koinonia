import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../middleware/auth'
import { OrganizationController } from '../controllers/OrganizationController'

export async function organizationRoutes(fastify: FastifyInstance) {
  const ctrl = new OrganizationController()
  const requireAuth = { preHandler: [authMiddleware] }

  fastify.post('/', requireAuth, ctrl.create.bind(ctrl))
  fastify.get('/members', requireAuth, ctrl.getMembers.bind(ctrl))
  fastify.post('/members/invite', requireAuth, ctrl.inviteMember.bind(ctrl))
  fastify.patch('/members/:userId/role', requireAuth, ctrl.updateMemberRole.bind(ctrl))
  fastify.post('/transfer-presidency', requireAuth, ctrl.transferPresidency.bind(ctrl))
}
