import { CreateConfiguracaoEvento, CreateEvento } from '../../../db/schema'
import { EventoRepository } from '../repositories/EventoRepository'

interface UpdateEventoRequest {
  id: string
  nome?: string
  descricao?: string | null
  data_inicio?: string
  data_fim?: string
  capacidade_maxima?: number
  local_id?: string | null
  status?: 'rascunho' | 'aberto' | 'encerrado' | 'realizado' | 'cancelado'
  configuracoes?: {
    papel: 'encontrista' | 'servo'
    valor: number
  }[]
}

export class UpdateEventoUseCase {
  constructor(private eventoRepository: EventoRepository) {}

  async execute(request: UpdateEventoRequest) {
    const { id, configuracoes, ...eventoData } = request

    const existingEvento = await this.eventoRepository.findById(id)
    if (!existingEvento) {
      throw new Error('Evento não encontrado')
    }

    const nextData = {
      nome: eventoData.nome ?? existingEvento.nome,
      descricao: eventoData.descricao === undefined ? existingEvento.descricao : eventoData.descricao,
      data_inicio: eventoData.data_inicio ?? existingEvento.data_inicio,
      data_fim: eventoData.data_fim ?? existingEvento.data_fim,
      capacidade_maxima: eventoData.capacidade_maxima ?? existingEvento.capacidade_maxima,
      local_id: eventoData.local_id === undefined ? existingEvento.local_id : eventoData.local_id,
      status: eventoData.status ?? existingEvento.status,
    }

    this.validateRequest(nextData, configuracoes)

    await this.eventoRepository.update(id, nextData as Partial<CreateEvento>)

    if (configuracoes !== undefined) {
      const normalizedConfigs: CreateConfiguracaoEvento[] = configuracoes.map((config) => ({
        evento_id: id,
        papel: config.papel,
        valor: config.valor.toString(),
      }))

      await this.eventoRepository.replaceConfigs(id, normalizedConfigs)
    }

    return await this.eventoRepository.findById(id)
  }

  private validateRequest(
    eventoData: {
      data_inicio: string | Date
      data_fim: string | Date
      capacidade_maxima: number
    },
    configuracoes?: { papel: 'encontrista' | 'servo'; valor: number }[],
  ) {
    if (new Date(eventoData.data_inicio) > new Date(eventoData.data_fim)) {
      throw new Error('Data de início não pode ser maior que a data de fim')
    }

    if (eventoData.capacidade_maxima <= 0) {
      throw new Error('Capacidade máxima deve ser maior que zero')
    }

    const papeis = new Set<string>()
    for (const config of configuracoes || []) {
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
