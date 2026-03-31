import { FastifyInstance } from 'fastify'
import { auth } from '../config/auth'
import * as fs from 'fs'

export async function authRoutes(app: FastifyInstance) {
  // Mount Better Auth handler
  app.all('/api/v1/auth/*', async (request, reply) => {
    // Convert Fastify request to Web Request
    const protocol = request.protocol || 'http'
    const host = request.hostname || 'localhost'
    const url = new URL(request.url, `${protocol}://${host}`)
    
    const webRequest = new Request(url.href, {
      method: request.method,
      headers: request.headers as any,
      body: ['POST', 'PUT', 'PATCH'].includes(request.method) && request.body ? JSON.stringify(request.body) : undefined
    })

    if (process.env.NODE_ENV === 'test') {
      fs.appendFileSync('/tmp/auth_debug.log', `Incoming Auth Request: ${request.method} ${request.url}\nHeaders: ${JSON.stringify(request.headers, null, 2)}\n`)
    }

    try {
      const response = await auth.handler(webRequest)
      return response
    } catch (error) {
      console.error('Better Auth Handler Error:', error)
      reply.status(500).send({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
      })
    }
  })
}
