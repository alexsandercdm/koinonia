import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import path from 'path'
import { env } from './config/env'
import { tenantMiddleware } from './middleware/tenant'
import { acomodacaoRoutes } from './modules/acomodacoes/routes/acomodacoes'
import { participanteRoutes } from './modules/pessoas/routes/participantes'
import { inscricaoRoutes } from './modules/inscricoes/routes/inscricoes'
import { authRoutes } from './routes/auth'
import { customAuthRoutes } from './routes/custom-auth'
import { adminRoutes } from './modules/admin/routes/admin'
import { financeiroRoutes } from './modules/financeiro/routes/financeiro'

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'error',
    },
  })

  // console.log('Ambiente:', env.NODE_ENV);
  // console.log('CORS Origin:', env.CORS_ORIGIN);
  // console.log('JWT Secret:', env.JWT_SECRET);

  // Register plugins
  app.register(cors, {
    origin: typeof env.CORS_ORIGIN === 'string' ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true,
    credentials: true,
  })

  // Register JWT
  app.register(jwt, {
    secret: env.JWT_SECRET || 'secret123',
  })

  app.register(multipart)
  app.register(tenantMiddleware)

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
  app.register(customAuthRoutes, { prefix: '/api/v1/auth' })
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(participanteRoutes, { prefix: '/api/v1' })
  app.register(inscricaoRoutes, { prefix: '/api/v1' })
  app.register(acomodacaoRoutes, { prefix: '/api/v1' })
  app.register(adminRoutes, { prefix: '/api/v1' })
  app.register(financeiroRoutes, { prefix: '/api/v1' })

  return app
}
