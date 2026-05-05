import { FastifyReply, FastifyRequest } from 'fastify'
import { AssignCamaDTO } from '@koinonia/shared'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { AcomodacaoError, isAcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'
import { AssignCamaUseCase } from '../usecases/AssignCamaUseCase'
import { ListInscricoesDisponiveisUseCase } from '../usecases/ListInscricoesDisponiveisUseCase'
import { ListMapaAcomodacaoUseCase } from '../usecases/ListMapaAcomodacaoUseCase'
import { ReleaseCamaUseCase } from '../usecases/ReleaseCamaUseCase'

export class AcomodacaoOperationsController {
  private buildRepository(request: FastifyRequest, reply: FastifyReply) {
    return new AcomodacaoRepository(db, requireTenantCtx(request, reply))
  }

  async listMapa(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventoId } = request.params as { eventoId: string }
      const useCase = new ListMapaAcomodacaoUseCase(this.buildRepository(request, reply))
      const mapa = await useCase.execute(eventoId)
      return reply.send(mapa)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listInscricoesDisponiveis(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventoId } = request.params as { eventoId: string }
      const { q } = request.query as { q?: string }
      const useCase = new ListInscricoesDisponiveisUseCase(this.buildRepository(request, reply))
      const inscricoes = await useCase.execute({ eventoId, query: q })
      return reply.send(inscricoes)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async assignCama(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { camaId } = request.params as { camaId: string }
      if (!request.body || typeof request.body !== 'object') {
        throw new AcomodacaoError('Body da requisição é obrigatório', 400)
      }
      const payload = AssignCamaDTO.parse(request.body)
      const useCase = new AssignCamaUseCase(this.buildRepository(request, reply))
      const inscricao = await useCase.execute({
        camaId,
        inscricaoId: payload.inscricao_id,
      })
      return reply.send(inscricao)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async releaseCama(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { camaId } = request.params as { camaId: string }
      const useCase = new ReleaseCamaUseCase(this.buildRepository(request, reply))
      const inscricao = await useCase.execute({ camaId })
      return reply.send(inscricao)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  private handleError(error: unknown, reply: FastifyReply) {
    if (isAcomodacaoError(error)) {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    if (error instanceof Error) {
      return reply.status(400).send({ error: error.message })
    }

    return reply.status(500).send({ error: 'Internal server error' })
  }
}
