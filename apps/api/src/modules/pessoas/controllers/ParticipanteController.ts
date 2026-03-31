import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateParticipanteUseCase } from '../usecases/CreateParticipanteUseCase'
import { ListParticipantesUseCase } from '../usecases/ListParticipantesUseCase'
import { GetParticipanteByIdUseCase } from '../usecases/GetParticipanteByIdUseCase'
import { GetParticipanteHistoricoUseCase } from '../usecases/GetParticipanteHistoricoUseCase'
import { UpdateParticipanteSaudeUseCase } from '../usecases/UpdateParticipanteSaudeUseCase'
import { DeleteParticipanteUseCase } from '../usecases/DeleteParticipanteUseCase'
import { db } from '../../../db'

export class ParticipanteController {
  private createUseCase: CreateParticipanteUseCase
  private listUseCase: ListParticipantesUseCase
  private getByIdUseCase: GetParticipanteByIdUseCase
  private getHistoricoUseCase: GetParticipanteHistoricoUseCase
  private updateSaudeUseCase: UpdateParticipanteSaudeUseCase
  private deleteUseCase: DeleteParticipanteUseCase

  constructor() {
    this.createUseCase = new CreateParticipanteUseCase(db)
    this.listUseCase = new ListParticipantesUseCase(db)
    this.getByIdUseCase = new GetParticipanteByIdUseCase(db)
    this.getHistoricoUseCase = new GetParticipanteHistoricoUseCase(db)
    this.updateSaudeUseCase = new UpdateParticipanteSaudeUseCase(db)
    this.deleteUseCase = new DeleteParticipanteUseCase(db)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const participante = await this.createUseCase.execute(request.body as any)
      return reply.status(201).send(participante)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { q, page = 1, pageSize = 20 } = request.query as any
      const result = await this.listUseCase.execute({ q, page, pageSize })
      return reply.send(result)
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
      const participante = await this.getByIdUseCase.execute(id)
      if (!participante) {
        return reply.status(404).send({ error: 'Participante not found' })
      }
      return reply.send(participante)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getHistorico(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const historico = await this.getHistoricoUseCase.execute(id)
      return reply.send(historico)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async updateSaude(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const updateData = request.body as any
      const participante = await this.updateSaudeUseCase.execute(id, updateData)
      return reply.send(participante)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await this.deleteUseCase.execute(id)
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
