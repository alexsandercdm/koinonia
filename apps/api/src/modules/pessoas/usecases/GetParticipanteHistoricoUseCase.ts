import { Database } from '../../../db'
import { pessoas, inscricoes, eventos } from '../../../db/schema'
import { eq, isNull } from 'drizzle-orm'

export class GetParticipanteHistoricoUseCase {
  constructor(private db: Database) {}

  async execute(pessoaId: string) {
    const historico = await this.db.select({
      evento: eventos,
      inscricao: inscricoes
    })
      .from(inscricoes)
      .innerJoin(eventos, eq(inscricoes.evento_id, eventos.id))
      .where(eq(inscricoes.pessoa_id, pessoaId))
      .orderBy(eventos.data_inicio)

    return historico
  }
}
