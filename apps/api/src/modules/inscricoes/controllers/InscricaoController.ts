import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../../../db'
import { InscricaoRepository } from '../repositories/InscricaoRepository'
import { EventoRepository } from '../repositories/EventoRepository'
import { PagamentoRepository } from '../repositories/PagamentoRepository'
import { RegisterInscricaoUseCase } from '../usecases/RegisterInscricaoUseCase'
import { RecordPagamentoUseCase } from '../usecases/RecordPagamentoUseCase'
import { ReplaceParticipanteUseCase } from '../usecases/ReplaceParticipanteUseCase'
import { CancelInscricaoUseCase } from '../usecases/CancelInscricaoUseCase'
import { GetInadimplentesUseCase } from '../usecases/GetInadimplentesUseCase'

export class InscricaoController {
  private registerUseCase: RegisterInscricaoUseCase
  private recordPagamentoUseCase: RecordPagamentoUseCase
  private replaceUseCase: ReplaceParticipanteUseCase
  private cancelUseCase: CancelInscricaoUseCase
  private getInadimplentesUseCase: GetInadimplentesUseCase
  private repository: InscricaoRepository

  constructor() {
    this.repository = new InscricaoRepository(db)
    const eventoRepo = new EventoRepository(db)
    const pagamentoRepo = new PagamentoRepository(db)

    this.registerUseCase = new RegisterInscricaoUseCase(this.repository, eventoRepo)
    this.recordPagamentoUseCase = new RecordPagamentoUseCase(pagamentoRepo, this.repository)
    this.replaceUseCase = new ReplaceParticipanteUseCase(this.repository)
    this.cancelUseCase = new CancelInscricaoUseCase(this.repository, pagamentoRepo)
    this.getInadimplentesUseCase = new GetInadimplentesUseCase(this.repository, pagamentoRepo)
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const inscricao = await this.registerUseCase.execute(request.body as any)
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
      const pagamento = await this.recordPagamentoUseCase.execute({
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
      const inscricao = await this.replaceUseCase.execute({
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
      const result = await this.cancelUseCase.execute({
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
      const inadimplentes = await this.getInadimplentesUseCase.execute(evento_id)
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
      const inscricao = await this.repository.findById(id)
      if (!inscricao) {
        return reply.status(404).send({ error: 'Inscrição não encontrada' })
      }
      return reply.send(inscricao)
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
