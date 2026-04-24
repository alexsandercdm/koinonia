import { db } from '../../../db'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  camaId: string
  inscricaoId: string
}

export class AssignCamaUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ camaId, inscricaoId }: Input) {
    return db.transaction(async (tx) => {
      const cama = await this.repository.lockCama(tx, camaId)
      if (!cama) {
        throw new AcomodacaoError('Cama não encontrada', 404)
      }

      const inscricao = await this.repository.lockInscricao(tx, inscricaoId)
      if (!inscricao) {
        throw new AcomodacaoError('Inscrição não encontrada', 404)
      }

      if (!inscricao.local_id) {
        throw new AcomodacaoError('Evento não possui local vinculado para operar acomodações', 400)
      }

      if (inscricao.status === 'CANCELADA') {
        throw new AcomodacaoError('Inscrição cancelada não pode receber cama', 422)
      }

      if (inscricao.cama_id) {
        throw new AcomodacaoError('Inscrição já possui cama atribuída', 409)
      }

      if (cama.local_id !== inscricao.local_id) {
        throw new AcomodacaoError('Cama não pertence ao local configurado para o evento da inscrição', 422)
      }

      if (cama.bloqueada) {
        throw new AcomodacaoError('Cama bloqueada não pode receber atribuições', 409)
      }

      if (cama.genero_permitido !== 'MISTO' && cama.genero_permitido !== inscricao.genero) {
        throw new AcomodacaoError('Participante incompatível com o gênero permitido do quarto', 422)
      }

      const ocupacoes = await this.repository.lockOccupancyForBed(tx, inscricao.evento_id, camaId)
      if (ocupacoes.some((id: string) => id !== inscricao.id)) {
        throw new AcomodacaoError('Cama já está ocupada neste evento', 409)
      }

      return this.repository.assignCama(tx, inscricao.id, camaId)
    })
  }
}
