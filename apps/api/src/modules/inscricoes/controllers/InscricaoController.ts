import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { EventoRepository } from '../repositories/EventoRepository'
import { InscricaoRepository } from '../repositories/InscricaoRepository'
import { PagamentoRepository } from '../repositories/PagamentoRepository'
import { CancelInscricaoUseCase } from '../usecases/CancelInscricaoUseCase'
import { GetInadimplentesUseCase } from '../usecases/GetInadimplentesUseCase'
import { RecordPagamentoUseCase } from '../usecases/RecordPagamentoUseCase'
import { RegisterInscricaoUseCase } from '../usecases/RegisterInscricaoUseCase'
import { ReplaceParticipanteUseCase } from '../usecases/ReplaceParticipanteUseCase'

export class InscricaoController {
  private buildRepositories(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)

    return {
      eventoRepository: new EventoRepository(db, ctx),
      inscricaoRepository: new InscricaoRepository(db, ctx),
      pagamentoRepository: new PagamentoRepository(db, ctx),
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { eventoRepository, inscricaoRepository } = this.buildRepositories(request, reply)
      const useCase = new RegisterInscricaoUseCase(inscricaoRepository, eventoRepository)
      const inscricao = await useCase.execute(request.body as any)
      return reply.status(201).send(inscricao)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async addPayment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const user_id = (request as any).user.id
      const { inscricaoRepository, pagamentoRepository } = this.buildRepositories(request, reply)
      const useCase = new RecordPagamentoUseCase(pagamentoRepository, inscricaoRepository)
      const pagamento = await useCase.execute({
        ...(request.body as any),
        inscricao_id: id,
        usuario_registro_id: user_id,
      })
      return reply.status(201).send(pagamento)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async replace(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { new_pessoa_id } = request.body as any
      const { inscricaoRepository } = this.buildRepositories(request, reply)
      const useCase = new ReplaceParticipanteUseCase(inscricaoRepository)
      const inscricao = await useCase.execute({
        inscricao_id: id,
        new_pessoa_id,
      })
      return reply.send(inscricao)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const user_id = (request as any).user.id
      const { inscricaoRepository, pagamentoRepository } = this.buildRepositories(request, reply)
      const useCase = new CancelInscricaoUseCase(inscricaoRepository, pagamentoRepository)
      const result = await useCase.execute({
        ...(request.body as any),
        inscricao_id: id,
        usuario_registro_id: user_id,
      })
      return reply.send(result)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getInadimplentes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { evento_id } = request.params as any
      const { inscricaoRepository, pagamentoRepository } = this.buildRepositories(request, reply)
      const useCase = new GetInadimplentesUseCase(inscricaoRepository, pagamentoRepository)
      const inadimplentes = await useCase.execute(evento_id)
      return reply.send(inadimplentes)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { inscricaoRepository } = this.buildRepositories(request, reply)
      const inscricao = await inscricaoRepository.findById(id)
      if (!inscricao) {
        return reply.status(404).send({ error: 'Inscrição não encontrada' })
      }
      return reply.send(inscricao)
    } catch (_error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async listByEvento(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { inscricaoRepository } = this.buildRepositories(request, reply)
      const inscricoes = await inscricaoRepository.findByEventoId(id)
      return reply.send(inscricoes)
    } catch (_error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
