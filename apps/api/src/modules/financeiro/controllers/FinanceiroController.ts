import { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { FinanceiroRepository } from '../repositories/FinanceiroRepository'
import { CreateDespesaUseCase } from '../usecases/CreateDespesaUseCase'
import { GetMetricasUseCase } from '../usecases/GetMetricasUseCase'
import { ListDespesasUseCase } from '../usecases/ListDespesasUseCase'

export class FinanceiroController {
  private buildRepository(request: FastifyRequest, reply: FastifyReply) {
    return new FinanceiroRepository(db, requireTenantCtx(request, reply))
  }

  async getMetricas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { eventoId?: string }
      const useCase = new GetMetricasUseCase(this.buildRepository(request, reply))
      const metricas = await useCase.execute(query.eventoId)
      return reply.send(metricas)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async listDespesas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { eventoId?: string }
      const useCase = new ListDespesasUseCase(this.buildRepository(request, reply))
      const despesas = await useCase.execute(query.eventoId)
      return reply.send({ data: despesas })
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }

  async createDespesa(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        evento_id: string
        descricao: string
        categoria: string
        valor: string
        data_despesa: string
        comprovante_url?: string
        registrado_por?: string
      }

      const useCase = new CreateDespesaUseCase(this.buildRepository(request, reply))
      const despesa = await useCase.execute({
        evento_id: body.evento_id,
        descricao: body.descricao,
        categoria: body.categoria,
        valor: body.valor,
        data_despesa: body.data_despesa,
        comprovante_url: body.comprovante_url ?? null,
        registrado_por: body.registrado_por ?? null,
      })
      return reply.status(201).send(despesa)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ error: error.message })
      }
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}
