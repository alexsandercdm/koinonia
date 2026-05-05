import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateParticipanteUseCase } from '../usecases/CreateParticipanteUseCase'
import { ListParticipantesUseCase } from '../usecases/ListParticipantesUseCase'
import { GetParticipanteByIdUseCase } from '../usecases/GetParticipanteByIdUseCase'
import { GetParticipanteHistoricoUseCase } from '../usecases/GetParticipanteHistoricoUseCase'
import { UpdateParticipanteUseCase } from '../usecases/UpdateParticipanteUseCase'
import { UpdateParticipanteSaudeUseCase } from '../usecases/UpdateParticipanteSaudeUseCase'
import { DeleteParticipanteUseCase } from '../usecases/DeleteParticipanteUseCase'
import { AuditLogRepository } from '../repositories/AuditLogRepository'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'

export class ParticipanteController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ctx = requireTenantCtx(request, reply)
      const participante = await new CreateParticipanteUseCase(db, ctx).execute(request.body as any)
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
      const ctx = requireTenantCtx(request, reply)
      const result = await new ListParticipantesUseCase(db, ctx).execute({ q, page, pageSize })
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
      const ctx = requireTenantCtx(request, reply)
      const participante = await new GetParticipanteByIdUseCase(db, ctx).execute(id)
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
      const ctx = requireTenantCtx(request, reply)
      const historico = await new GetParticipanteHistoricoUseCase(db, ctx).execute(id)
      return reply.send(historico)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const updateData = request.body as any
      const user_id = (request as any).user.id
      const ctx = requireTenantCtx(request, reply)
      const useCase = new UpdateParticipanteUseCase(db, new AuditLogRepository(db, ctx), ctx)
      const participante = await useCase.execute(id, user_id, updateData)
      return reply.send(participante)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Participante not found') {
          return reply.status(404).send({ error: error.message })
        }

        if (error.message === 'Email already exists' || error.message === 'Phone already exists') {
          return reply.status(400).send({ error: error.message })
        }

        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async updateSaude(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const updateData = request.body as any
      const user_id = (request as any).user.id
      const ctx = requireTenantCtx(request, reply)
      const useCase = new UpdateParticipanteSaudeUseCase(db, new AuditLogRepository(db, ctx), ctx)
      const participante = await useCase.execute(id, user_id, updateData)
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
      const ctx = requireTenantCtx(request, reply)
      await new DeleteParticipanteUseCase(db, ctx).execute(id)
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
