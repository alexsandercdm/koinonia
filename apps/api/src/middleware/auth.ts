import { FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '../config/auth'

export interface AuthenticatedRequest extends Omit<FastifyRequest, 'user'> {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      reply.code(401).send({ error: 'Unauthorized - No token provided' })
      return
    }

    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    
    if (!session) {
      reply.code(401).send({ error: 'Unauthorized - Invalid token' })
      return
    }

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role || 'servo', // Default role if not present
    }
  } catch (error) {
    reply.code(401).send({ error: 'Unauthorized - Invalid token' })
  }
}

export function requireRole(requiredRole: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authMiddleware(request, reply)
    
    if (reply.statusCode === 401) {
      return
    }

    const userRole = (request as AuthenticatedRequest).user?.role
    
    if (!userRole || userRole !== requiredRole && userRole !== 'admin') {
      reply.code(403).send({ error: 'Forbidden - Insufficient permissions' })
      return
    }
  }
}
