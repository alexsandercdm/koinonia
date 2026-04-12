import { FastifyInstance } from 'fastify'
import { authMiddleware, requireRole } from '../../../middleware/auth'
import { AcomodacaoOperationsController } from '../controllers/AcomodacaoOperationsController'
import { AcomodacaoStructureController } from '../controllers/AcomodacaoStructureController'

export async function acomodacaoRoutes(fastify: FastifyInstance) {
  const structureController = new AcomodacaoStructureController()
  const operationsController = new AcomodacaoOperationsController()

  const requireAuth = { preHandler: [authMiddleware] }
  const requireLider = { preHandler: [requireRole('lider')] }

  fastify.get('/acomodacoes/locais', { ...requireAuth }, structureController.listLocais.bind(structureController))

  // Rotas flat para quartos e camas (para uso direto quando necessário)
  fastify.get('/acomodacoes/locais/:localId/quartos', { ...requireAuth }, structureController.listQuartosByLocal.bind(structureController))
  fastify.get('/acomodacoes/quartos/:quartoId/camas', { ...requireAuth }, structureController.listCamasByQuarto.bind(structureController))

  fastify.post('/acomodacoes/locais', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string' },
          endereco: { type: 'string' },
          capacidade_total: { type: 'integer' },
        },
      },
    },
  }, structureController.createLocal.bind(structureController))

  fastify.patch('/acomodacoes/locais/:localId', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          endereco: { type: 'string' },
          capacidade_total: { type: 'integer' },
        },
      },
    },
  }, structureController.updateLocal.bind(structureController))

  fastify.post('/acomodacoes/locais/:localId/quartos', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['nome', 'genero_permitido', 'capacidade'],
        properties: {
          nome: { type: 'string' },
          genero_permitido: { type: 'string', enum: ['M', 'F', 'MISTO'] },
          capacidade: { type: 'integer' },
        },
      },
    },
  }, structureController.createQuarto.bind(structureController))

  fastify.patch('/acomodacoes/quartos/:quartoId', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          genero_permitido: { type: 'string', enum: ['M', 'F', 'MISTO'] },
          capacidade: { type: 'integer' },
        },
      },
    },
  }, structureController.updateQuarto.bind(structureController))

  fastify.post('/acomodacoes/quartos/:quartoId/camas', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['identificacao', 'tipo'],
        properties: {
          identificacao: { type: 'string' },
          tipo: { type: 'string', enum: ['solteiro', 'beliche_superior', 'beliche_inferior', 'casal'] },
          bloqueada: { type: 'boolean' },
        },
      },
    },
  }, structureController.createCama.bind(structureController))

  fastify.patch('/acomodacoes/camas/:camaId', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        properties: {
          identificacao: { type: 'string' },
          tipo: { type: 'string', enum: ['solteiro', 'beliche_superior', 'beliche_inferior', 'casal'] },
          bloqueada: { type: 'boolean' },
        },
      },
    },
  }, structureController.updateCama.bind(structureController))

  fastify.get('/eventos/:eventoId/mapa-acomodacao', { ...requireAuth }, operationsController.listMapa.bind(operationsController))
  fastify.get('/eventos/:eventoId/inscricoes-sem-cama', { ...requireAuth }, operationsController.listInscricoesDisponiveis.bind(operationsController))

  fastify.post('/acomodacoes/camas/:camaId/atribuir', {
    ...requireLider,
    schema: {
      body: {
        type: 'object',
        required: ['inscricao_id'],
        properties: {
          inscricao_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, operationsController.assignCama.bind(operationsController))

  fastify.delete('/acomodacoes/camas/:camaId/atribuir', {
    ...requireLider,
  }, operationsController.releaseCama.bind(operationsController))
}
