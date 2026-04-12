import { db } from '../../../db'
import { AcomodacaoError } from '../errors'
import { AcomodacaoRepository } from '../repositories/AcomodacaoRepository'

interface Input {
  camaId: string
}

export class ReleaseCamaUseCase {
  constructor(private readonly repository: AcomodacaoRepository) {}

  async execute({ camaId }: Input) {
    return db.transaction(async (tx) => {
      const inscricao = await this.repository.findInscricaoByCamaIdForUpdate(tx, camaId)

      if (!inscricao) {
        throw new AcomodacaoError('Nenhuma inscrição ativa está ocupando esta cama', 404)
      }

      return this.repository.releaseCama(tx, inscricao.id)
    })
  }
}
