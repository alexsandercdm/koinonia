import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { EventoRepository } from '../repositories/EventoRepository'
import { CreateEventoUseCase } from '../usecases/CreateEventoUseCase'
import { ListEventosUseCase } from '../usecases/ListEventosUseCase'
import { UpdateEventoUseCase } from '../usecases/UpdateEventoUseCase'

export class EventoController {
  private buildRepository(request: FastifyRequest, reply: FastifyReply) {
    return new EventoRepository(db, requireTenantCtx(request, reply))
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = new CreateEventoUseCase(this.buildRepository(request, reply))
      const evento = await useCase.execute(request.body as any)
      return reply.status(201).send(evento)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = new ListEventosUseCase(this.buildRepository(request, reply))
      const eventos = await useCase.execute()
      return reply.send(eventos)
    } catch (_error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const useCase = new UpdateEventoUseCase(this.buildRepository(request, reply))
      const evento = await useCase.execute({
        id,
        ...(request.body as any),
      })

      return reply.send(evento)
    } catch (error) {
      if (error instanceof Error) {
        const statusCode = error.message === 'Evento não encontrado' ? 404 : 400
        return reply.status(statusCode).send({ error: error.message })
      }

      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const evento = await this.buildRepository(request, reply).findById(id)
      if (!evento) {
        return reply.status(404).send({ error: 'Evento não encontrado' })
      }
      return reply.send(evento)
    } catch (_error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
