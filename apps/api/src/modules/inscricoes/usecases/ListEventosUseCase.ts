import { EventoRepository } from '../repositories/EventoRepository'

export class ListEventosUseCase {
  constructor(private eventoRepository: EventoRepository) {}

  async execute() {
    const eventos = await this.eventoRepository.listWithStats()

    return eventos.map((evento) => {
      const inscritosCount = Number(evento.inscritos_count ?? 0)
      const capacidadeMaxima = Number(evento.capacidade_maxima ?? 0)
      const ocupacaoPercentual =
        capacidadeMaxima <= 0
          ? 0
          : Math.min(100, Math.round((inscritosCount / capacidadeMaxima) * 100))

      return {
        ...evento,
        inscritos_count: inscritosCount,
        ocupacao_percentual: ocupacaoPercentual,
      }
    })
  }
}
