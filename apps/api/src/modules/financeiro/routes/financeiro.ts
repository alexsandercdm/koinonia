import { FastifyInstance } from 'fastify'
import { FinanceiroController } from '../controllers/FinanceiroController'
import { authMiddleware, requireRole } from '../../../middleware/auth'

export async function financeiroRoutes(fastify: FastifyInstance) {
  const controller = new FinanceiroController()

  const requireAuth = { preHandler: [authMiddleware] }
  const requireLider = { preHandler: [requireRole('lider')] }

  fastify.get('/financeiro/metricas', {
    ...requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          eventoId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, controller.getMetricas.bind(controller))

  fastify.get('/financeiro/despesas', {
    ...requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          eventoId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, controller.listDespesas.bind(controller))

  fastify.post('/financeiro/despesas', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['evento_id', 'descricao', 'categoria', 'valor', 'data_despesa'],
        properties: {
          evento_id: { type: 'string', format: 'uuid' },
          descricao: { type: 'string', minLength: 1, maxLength: 300 },
          categoria: {
            type: 'string',
            enum: ['alimentacao', 'transporte', 'material', 'hospedagem', 'outro'],
          },
          valor: { type: 'string' },
          data_despesa: { type: 'string', format: 'date' },
          comprovante_url: { type: 'string' },
          registrado_por: { type: 'string' },
        },
      },
    },
  }, controller.createDespesa.bind(controller))
}
