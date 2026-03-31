import { FastifyInstance } from 'fastify'
import { ParticipanteController } from '../controllers/ParticipanteController'
import { authMiddleware, requireRole } from '../../../middleware/auth'

export async function participanteRoutes(fastify: FastifyInstance) {
  const controller = new ParticipanteController()
  
  const requireAuth = { preHandler: [authMiddleware] }
  const requireLider = { preHandler: [requireRole('lider')] }
  const requireAdmin = { preHandler: [requireRole('admin')] }

  fastify.get('/participantes', {
    ...requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 20 }
        }
      }
    }
  }, controller.list.bind(controller))

  fastify.post('/participantes', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'genero'],
        properties: {
          nome: { type: 'string', minLength: 1, maxLength: 200 },
          genero: { type: 'string', enum: ['M', 'F'] },
          data_nascimento: { type: 'string', format: 'date' },
          telefone: { type: 'string', maxLength: 20 },
          email: { type: 'string', format: 'email', maxLength: 200 },
          padrinho_id: { type: 'string', format: 'uuid' },
          alergias: { type: 'string' },
          restricoes_alimentares: { type: 'array', items: { type: 'string' } },
          medicamentos: { type: 'string' },
          condicoes_medicas: { type: 'string' },
          contato_emergencia_nome: { type: 'string', maxLength: 200 },
          contato_emergencia_tel: { type: 'string', maxLength: 20 }
        }
      }
    }
  }, controller.create.bind(controller))

  fastify.get('/participantes/:id', {
    ...requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, controller.getById.bind(controller))

  fastify.get('/participantes/:id/historico', {
    ...requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, controller.getHistorico.bind(controller))

  fastify.patch('/participantes/:id/saude', {
    ...requireLider,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      },
      body: {
        type: 'object',
        properties: {
          alergias: { type: 'string' },
          restricoes_alimentares: { type: 'array', items: { type: 'string' } },
          medicamentos: { type: 'string' },
          condicoes_medicas: { type: 'string' },
          contato_emergencia_nome: { type: 'string', maxLength: 200 },
          contato_emergencia_tel: { type: 'string', maxLength: 20 }
        }
      }
    }
  }, controller.updateSaude.bind(controller))

  fastify.delete('/participantes/:id', {
    ...requireAdmin,
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, controller.delete.bind(controller))
}
