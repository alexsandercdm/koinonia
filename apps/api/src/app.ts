import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import path from 'path'
import { env } from './config/env'
import { participanteRoutes } from './modules/pessoas/routes/participantes'
import { authRoutes } from './routes/auth'
import { customAuthRoutes } from './routes/custom-auth'

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'error',
    },
  })

  // Register plugins
  app.register(cors, {
    origin: typeof env.CORS_ORIGIN === 'string' ? env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })

  // Register JWT
  app.register(jwt, {
    secret: env.JWT_SECRET || 'secret123',
  })

  app.register(multipart)

  // Use a fallback for dirname to avoid crashes during tests if paths mismatch
  const uploadsPath = path.join(__dirname, '../uploads')
  app.register(staticFiles, {
    root: uploadsPath,
    prefix: '/uploads/',
  })

  // Health check
  app.get('/api/v1/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }
  })

  // Register routes
  app.register(authRoutes)
  app.register(customAuthRoutes)
  app.register(participanteRoutes, { prefix: '/api/v1' })

  return app
}
