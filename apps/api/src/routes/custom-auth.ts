import { FastifyInstance, FastifyRequest } from 'fastify'
import { db } from '../db'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'

export async function customAuthRoutes(app: FastifyInstance) {
  // Get current user
  app.get('/api/v1/auth/me', {
    preHandler: authMiddleware
  }, async (request: FastifyRequest) => {
    const authenticatedRequest = request as AuthenticatedRequest
    return {
      user: authenticatedRequest.user
    }
  })

  // Update user role (admin only)
  app.patch('/api/v1/auth/users/:userId/role', {
    preHandler: [authMiddleware, async (request: FastifyRequest, reply) => {
      const authenticatedRequest = request as AuthenticatedRequest
      if (authenticatedRequest.user?.role !== 'admin') {
        reply.code(403).send({ error: 'Forbidden - Admin only' })
      }
    }]
  }, async (request: FastifyRequest, reply) => {
    const { userId } = request.params as { userId: string }
    const { role } = request.body as { role: string }

    if (!['admin', 'lider', 'servo'].includes(role)) {
      reply.code(400).send({ error: 'Invalid role' })
      return
    }

    try {
      await db.update(user)
        .set({ role })
        .where(eq(user.id, userId))

      return { message: 'User role updated successfully' }
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update user role' })
    }
  })

  // List all users (admin only)
  app.get('/api/v1/auth/users', {
    preHandler: [authMiddleware, async (request: FastifyRequest, reply) => {
      const authenticatedRequest = request as AuthenticatedRequest
      if (authenticatedRequest.user?.role !== 'admin') {
        reply.code(403).send({ error: 'Forbidden - Admin only' })
      }
    }]
  }, async () => {
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }).from(user)

    return { users }
  })
}
