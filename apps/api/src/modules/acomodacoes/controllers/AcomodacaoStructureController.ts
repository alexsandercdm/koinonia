import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { AcomodacaoError, isAcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'
import { CreateLocalUseCase } from '../usecases/CreateLocalUseCase'
import { UpdateLocalUseCase } from '../usecases/UpdateLocalUseCase'
import { CreateQuartoUseCase } from '../usecases/CreateQuartoUseCase'
import { UpdateQuartoUseCase } from '../usecases/UpdateQuartoUseCase'
import { CreateCamaUseCase } from '../usecases/CreateCamaUseCase'
import { UpdateCamaUseCase } from '../usecases/UpdateCamaUseCase'
import { ListLocaisEstruturaUseCase } from '../usecases/ListLocaisEstruturaUseCase'

export class AcomodacaoStructureController {
  private readonly repository = new AcomodacaoRepository(db)
  private readonly listLocaisEstruturaUseCase = new ListLocaisEstruturaUseCase(this.repository)
  private readonly createLocalUseCase = new CreateLocalUseCase(this.repository)
  private readonly updateLocalUseCase = new UpdateLocalUseCase(this.repository)
  private readonly createQuartoUseCase = new CreateQuartoUseCase(this.repository)
  private readonly updateQuartoUseCase = new UpdateQuartoUseCase(this.repository)
  private readonly createCamaUseCase = new CreateCamaUseCase(this.repository)
  private readonly updateCamaUseCase = new UpdateCamaUseCase(this.repository)

  async listLocais(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const locais = await this.listLocaisEstruturaUseCase.execute()
      return reply.send(locais)
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async listQuartosByLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { localId } = request.params as { localId: string }
      const locais = await this.listLocaisEstruturaUseCase.execute()
      const local = locais.find(l => l.id === localId)
      if (!local) {
        throw new AcomodacaoError('Local não encontrado', 404)
      }
      // Extrai quartos da estrutura aninhada
      const quartos = local.quartos ?? []
      return reply.send(quartos)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listCamasByQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      const locais = await this.listLocaisEstruturaUseCase.execute()
      const quarto = locais
        .flatMap(l => l.quartos ?? [])
        .find(q => q.id === quartoId)
      if (!quarto) {
        throw new AcomodacaoError('Quarto não encontrado', 404)
      }
      // Extrai camas da estrutura aninhada
      const camas = quarto.camas ?? []
      return reply.send(camas)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const local = await this.createLocalUseCase.execute(request.body as any)
      return reply.status(201).send(local)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async updateLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { localId } = request.params as { localId: string }
      const local = await this.updateLocalUseCase.execute({
        localId,
        ...(request.body as object),
      })
      return reply.send(local)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { localId } = request.params as { localId: string }
      const body = request.body as Record<string, unknown>
      const quarto = await this.createQuartoUseCase.execute({
        localId,
        nome: body.nome as string,
        genero_permitido: body.genero_permitido as 'M' | 'F' | 'MISTO',
        capacidade: body.capacidade as number,
      })
      return reply.status(201).send(quarto)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async deleteQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      await this.repository.deleteQuarto(quartoId)
      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async updateQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      const body = request.body as Record<string, unknown>
      const quarto = await this.updateQuartoUseCase.execute({
        quartoId,
        nome: body.nome as string | undefined,
        genero_permitido: body.genero_permitido as 'M' | 'F' | 'MISTO' | undefined,
        capacidade: body.capacidade as number | undefined,
      })
      return reply.send(quarto)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createCama(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      const body = request.body as Record<string, unknown>
      const cama = await this.createCamaUseCase.execute({
        quartoId,
        identificacao: body.identificacao as string,
        tipo: body.tipo as 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal',
        bloqueada: body.bloqueada as boolean | undefined,
      })
      return reply.status(201).send(cama)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async updateCama(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { camaId } = request.params as { camaId: string }
      const body = request.body as Record<string, unknown>
      const cama = await this.updateCamaUseCase.execute({
        camaId,
        identificacao: body.identificacao as string | undefined,
        tipo: body.tipo as 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal' | undefined,
        bloqueada: body.bloqueada as boolean | undefined,
      })
      return reply.send(cama)
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
