import { FastifyInstance } from 'fastify'
import { EventoController } from '../controllers/EventoController'
import { InscricaoController } from '../controllers/InscricaoController'
import { authMiddleware, requireRole } from '../../../middleware/auth'

export async function inscricaoRoutes(fastify: FastifyInstance) {
  const eventoController = new EventoController()
  const inscricaoController = new InscricaoController()

  const requireAuth = { preHandler: [authMiddleware] }
  const requireLider = { preHandler: [requireRole('lider')] }
  const requireAdmin = { preHandler: [requireRole('admin')] }

  // Eventos
  fastify.post('/eventos', {
    ...requireAdmin,
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'data_inicio', 'data_fim', 'capacidade_maxima'],
        properties: {
          nome: { type: 'string' },
          descricao: { type: 'string' },
          data_inicio: { type: 'string', format: 'date-time' },
          data_fim: { type: 'string', format: 'date-time' },
          capacidade_maxima: { type: 'number' },
          local_id: { type: 'string', format: 'uuid' },
          configuracoes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['papel', 'valor'],
              properties: {
                papel: { type: 'string', enum: ['encontrista', 'servo'] },
                valor: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, eventoController.create.bind(eventoController))

  fastify.put('/eventos/:id', {
    ...requireAdmin,
    schema: {
      body: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          descricao: { type: ['string', 'null'] },
          data_inicio: { type: 'string', format: 'date-time' },
          data_fim: { type: 'string', format: 'date-time' },
          capacidade_maxima: { type: 'number' },
          local_id: { type: ['string', 'null'], format: 'uuid' },
          status: { type: 'string', enum: ['rascunho', 'aberto', 'encerrado', 'realizado', 'cancelado'] },
          configuracoes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['papel', 'valor'],
              properties: {
                papel: { type: 'string', enum: ['encontrista', 'servo'] },
                valor: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, eventoController.update.bind(eventoController))

  fastify.get('/eventos', { ...requireAuth }, eventoController.list.bind(eventoController))
  fastify.get('/eventos/:id', { ...requireAuth }, eventoController.getById.bind(eventoController))

  // Inscrições
  fastify.post('/inscricoes', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['evento_id', 'pessoa_id', 'papel'],
        properties: {
          evento_id: { type: 'string', format: 'uuid' },
          pessoa_id: { type: 'string', format: 'uuid' },
          papel: { type: 'string', enum: ['encontrista', 'servo'] },
          observacoes: { type: 'string' }
        }
      }
    }
  }, inscricaoController.register.bind(inscricaoController))

  fastify.get('/inscricoes/:id', { ...requireAuth }, inscricaoController.getById.bind(inscricaoController))

  fastify.post('/inscricoes/:id/pagamentos', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['valor', 'forma_pagamento'],
        properties: {
          valor: { type: 'number' },
          forma_pagamento: { type: 'string' },
          comprovante_url: { type: 'string' },
          data_pagamento: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, inscricaoController.addPayment.bind(inscricaoController))

  fastify.post('/inscricoes/:id/substituir', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['new_pessoa_id'],
        properties: {
          new_pessoa_id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, inscricaoController.replace.bind(inscricaoController))

  fastify.post('/inscricoes/:id/cancelar', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        properties: {
          refund_amount: { type: 'number' },
          forma_estorno: { type: 'string' }
        }
      }
    }
  }, inscricaoController.cancel.bind(inscricaoController))

  fastify.get('/eventos/:evento_id/inadimplentes', {
    ...requireLider
  }, inscricaoController.getInadimplentes.bind(inscricaoController))
}
