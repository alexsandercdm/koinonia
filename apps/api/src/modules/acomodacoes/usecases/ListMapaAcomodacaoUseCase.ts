import { MapaAcomodacaoSchema } from '@koinonia/shared'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'
import { AcomodacaoError } from '../errors'

export class ListMapaAcomodacaoUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute(eventoId: string) {
    const result = await this.repository.getMapaAcomodacao(eventoId)

    if (!result.evento) {
      throw new AcomodacaoError('Evento não encontrado', 404)
    }

    if (!result.evento.local_id || !result.evento.local) {
      throw new AcomodacaoError('Evento não possui local vinculado para montar o mapa de acomodação', 400)
    }

    const ocupacaoPorCama = new Map(
      result.inscricoesAtivas
        .filter((item) => item.cama_id)
        .map((item) => [item.cama_id as string, item]),
    )

    const response = {
      evento: {
        id: result.evento.id,
        nome: result.evento.nome,
        local_id: result.evento.local_id,
      },
      local: {
        id: result.evento.local.id,
        nome: result.evento.local.nome,
        endereco: result.evento.local.endereco ?? null,
        capacidade_total: result.evento.local.capacidade_total ?? null,
      },
      quartos: [...result.quartos]
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((quarto) => ({
          id: quarto.id,
          local_id: quarto.local_id,
          nome: quarto.nome,
          genero_permitido: quarto.genero_permitido as 'M' | 'F' | 'MISTO',
          capacidade: quarto.capacidade,
          camas: [...quarto.camas]
            .sort((a, b) => (a.identificacao ?? '').localeCompare(b.identificacao ?? ''))
            .map((cama) => {
              const ocupacao = ocupacaoPorCama.get(cama.id)
              const status = cama.bloqueada ? 'bloqueado' : ocupacao ? 'ocupado' : 'disponivel'

              return {
                id: cama.id,
                quarto_id: cama.quarto_id,
                identificacao: cama.identificacao ?? null,
                tipo: cama.tipo as 'solteiro' | 'beliche_superior' | 'beliche_inferior' | 'casal',
                bloqueada: cama.bloqueada,
                status,
                ocupante: ocupacao
                  ? {
                      inscricao_id: ocupacao.id,
                      pessoa_id: ocupacao.pessoa_id,
                      nome: ocupacao.nome,
                      genero: ocupacao.genero as 'M' | 'F',
                      papel: ocupacao.papel as 'encontrista' | 'servo',
                      status: ocupacao.status,
                    }
                  : null,
              }
            }),
        })),
    }

    return MapaAcomodacaoSchema.parse(response)
  }
}
