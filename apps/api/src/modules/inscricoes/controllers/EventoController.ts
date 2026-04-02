import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../../../db'
import { EventoRepository } from '../repositories/EventoRepository'
import { CreateEventoUseCase } from '../usecases/CreateEventoUseCase'
import { UpdateEventoUseCase } from '../usecases/UpdateEventoUseCase'

export class EventoController {
  private createUseCase: CreateEventoUseCase
  private updateUseCase: UpdateEventoUseCase
  private repository: EventoRepository

  constructor() {
    this.repository = new EventoRepository(db)
    this.createUseCase = new CreateEventoUseCase(this.repository)
    this.updateUseCase = new UpdateEventoUseCase(this.repository)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const evento = await this.createUseCase.execute(request.body as any)
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
      const eventos = await this.repository.list()
      return reply.send(eventos)
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const evento = await this.updateUseCase.execute({
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
      const evento = await this.repository.findById(id)
      if (!evento) {
        return reply.status(404).send({ error: 'Evento não encontrado' })
      }
      return reply.send(evento)
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
