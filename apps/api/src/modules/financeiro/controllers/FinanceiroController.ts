import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../../../db'
import { GetMetricasUseCase } from '../usecases/GetMetricasUseCase'
import { ListDespesasUseCase } from '../usecases/ListDespesasUseCase'
import { CreateDespesaUseCase } from '../usecases/CreateDespesaUseCase'

export class FinanceiroController {
  private getMetricasUseCase: GetMetricasUseCase
  private listDespesasUseCase: ListDespesasUseCase
  private createDespesaUseCase: CreateDespesaUseCase

  constructor() {
    this.getMetricasUseCase = new GetMetricasUseCase(db)
    this.listDespesasUseCase = new ListDespesasUseCase(db)
    this.createDespesaUseCase = new CreateDespesaUseCase(db)
  }

  async getMetricas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { eventoId?: string }
      const metricas = await this.getMetricasUseCase.execute(query.eventoId)
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
      const despesas = await this.listDespesasUseCase.execute(query.eventoId)
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

      const despesa = await this.createDespesaUseCase.execute({
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
