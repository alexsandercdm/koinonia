import { EventoRepository } from '../repositories/EventoRepository'
import { CreateEvento } from '../../../db/schema'

interface CreateEventoRequest {
  nome: string
  descricao?: string
  data_inicio: string
  data_fim: string
  capacidade_maxima: number
  local_id?: string
  configuracoes?: {
    papel: 'encontrista' | 'servo'
    valor: number
  }[]
}

export class CreateEventoUseCase {
  constructor(private eventoRepository: EventoRepository) {}

  async execute(request: CreateEventoRequest) {
    const { configuracoes, ...eventoData } = request

    this.validateRequest(request)

    // Create the event
    const evento = await this.eventoRepository.create({
      ...eventoData,
      status: 'rascunho',
    } as CreateEvento)

    // Add configurations if provided
    if (configuracoes && configuracoes.length > 0) {
      for (const config of configuracoes) {
        await this.eventoRepository.addConfig({
          evento_id: evento.id,
          papel: config.papel,
          valor: config.valor.toString(),
        })
      }
    }

    // Return the event with its configurations
    return await this.eventoRepository.findById(evento.id)
  }

  private validateRequest(request: CreateEventoRequest) {
    if (new Date(request.data_inicio) > new Date(request.data_fim)) {
      throw new Error('Data de início não pode ser maior que a data de fim')
    }

    if (request.capacidade_maxima <= 0) {
      throw new Error('Capacidade máxima deve ser maior que zero')
    }

    const papeis = new Set<string>()
    for (const config of request.configuracoes || []) {
      if (config.valor < 0) {
        throw new Error('Valor da configuração não pode ser negativo')
      }

      if (papeis.has(config.papel)) {
        throw new Error(`Configuração duplicada para o papel: ${config.papel}`)
      }

      papeis.add(config.papel)
    }
  }
}
