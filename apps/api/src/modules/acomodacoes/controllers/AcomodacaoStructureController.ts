import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { AcomodacaoError, isAcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'
import { CreateCamaUseCase } from '../usecases/CreateCamaUseCase'
import { CreateLocalUseCase } from '../usecases/CreateLocalUseCase'
import { CreateQuartoUseCase } from '../usecases/CreateQuartoUseCase'
import { ListLocaisEstruturaUseCase } from '../usecases/ListLocaisEstruturaUseCase'
import { UpdateCamaUseCase } from '../usecases/UpdateCamaUseCase'
import { UpdateLocalUseCase } from '../usecases/UpdateLocalUseCase'
import { UpdateQuartoUseCase } from '../usecases/UpdateQuartoUseCase'

export class AcomodacaoStructureController {
  private buildRepository(request: FastifyRequest, reply: FastifyReply) {
    return new AcomodacaoRepository(db, requireTenantCtx(request, reply))
  }

  async listLocais(request: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = new ListLocaisEstruturaUseCase(this.buildRepository(request, reply))
      const locais = await useCase.execute()
      return reply.send(locais)
    } catch (_error) {
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async listQuartosByLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { localId } = request.params as { localId: string }
      const useCase = new ListLocaisEstruturaUseCase(this.buildRepository(request, reply))
      const locais = await useCase.execute()
      const local = locais.find((item) => item.id === localId)
      if (!local) {
        throw new AcomodacaoError('Local não encontrado', 404)
      }
      return reply.send(local.quartos ?? [])
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async listCamasByQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      const useCase = new ListLocaisEstruturaUseCase(this.buildRepository(request, reply))
      const locais = await useCase.execute()
      const quarto = locais.flatMap((item) => item.quartos ?? []).find((item) => item.id === quartoId)
      if (!quarto) {
        throw new AcomodacaoError('Quarto não encontrado', 404)
      }
      return reply.send(quarto.camas ?? [])
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async createLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = new CreateLocalUseCase(this.buildRepository(request, reply))
      const local = await useCase.execute(request.body as any)
      return reply.status(201).send(local)
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async updateLocal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { localId } = request.params as { localId: string }
      const useCase = new UpdateLocalUseCase(this.buildRepository(request, reply))
      const local = await useCase.execute({
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
      const useCase = new CreateQuartoUseCase(this.buildRepository(request, reply))
      const quarto = await useCase.execute({
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
      await this.buildRepository(request, reply).deleteQuarto(quartoId)
      return reply.status(204).send()
    } catch (error) {
      return this.handleError(error, reply)
    }
  }

  async updateQuarto(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { quartoId } = request.params as { quartoId: string }
      const body = request.body as Record<string, unknown>
      const useCase = new UpdateQuartoUseCase(this.buildRepository(request, reply))
      const quarto = await useCase.execute({
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
      const useCase = new CreateCamaUseCase(this.buildRepository(request, reply))
      const cama = await useCase.execute({
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
      const useCase = new UpdateCamaUseCase(this.buildRepository(request, reply))
      const cama = await useCase.execute({
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
