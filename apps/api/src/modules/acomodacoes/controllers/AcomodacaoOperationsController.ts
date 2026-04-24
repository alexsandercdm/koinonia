import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { AcomodacaoError, isAcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'
import { AssignCamaUseCase } from '../usecases/AssignCamaUseCase'
import { ListInscricoesDisponiveisUseCase } from '../usecases/ListInscricoesDisponiveisUseCase'
import { ListMapaAcomodacaoUseCase } from '../usecases/ListMapaAcomodacaoUseCase'
import { ReleaseCamaUseCase } from '../usecases/ReleaseCamaUseCase'
import { AssignCamaDTO } from '@koinonia/shared'

export class AcomodacaoOperationsController {
  private readonly repository = new AcomodacaoRepository(db)
  private readonly listMapaUseCase = new ListMapaAcomodacaoUseCase(this.repository)
  private readonly listInscricoesDisponiveisUseCase = new ListInscricoesDisponiveisUseCase(this.repository)
  private readonly assignCamaUseCase = new AssignCamaUseCase(this.repository)
  private readonly releaseCamaUseCase = new ReleaseCamaUseCase(this.repository)

  async listMapa(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventoId } = request.params as { eventoId: string }
      const mapa = await this.listMapaUseCase.execute(eventoId)
      return reply.send(mapa)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listInscricoesDisponiveis(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventoId } = request.params as { eventoId: string }
      const { q } = request.query as { q?: string }
      const inscricoes = await this.listInscricoesDisponiveisUseCase.execute({ eventoId, query: q })
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
      const inscricao = await this.assignCamaUseCase.execute({
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
      const inscricao = await this.releaseCamaUseCase.execute({ camaId })
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
