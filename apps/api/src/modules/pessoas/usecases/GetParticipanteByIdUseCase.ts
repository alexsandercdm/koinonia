import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export class GetParticipanteByIdUseCase {
  constructor(private db: Database) {}

  async execute(id: string) {
    const [participante] = await this.db.select()
      .from(pessoas)
      .where(and(eq(pessoas.id, id), isNull(pessoas.deleted_at)))
      .limit(1)

    return participante || null
  }
}
