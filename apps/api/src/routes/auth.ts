import { FastifyInstance } from 'fastify'
import { auth } from '../config/auth'

export async function authRoutes(app: FastifyInstance) {
  // Mount Better Auth handler
  app.all('/api/v1/auth/*', async (request, reply) => {
    const authRequest = request.raw
    const authReply = reply.raw
    
    // @ts-ignore - Better Auth handler expects Node request/response
    return auth.handler(authRequest, authReply)
  })
}
