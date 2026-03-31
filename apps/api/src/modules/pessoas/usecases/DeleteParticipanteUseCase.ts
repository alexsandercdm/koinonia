import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export class DeleteParticipanteUseCase {
  constructor(private db: Database) {}

  async execute(id: string) {
    await this.db.update(pessoas)
      .set({ deleted_at: new Date() })
      .where(and(eq(pessoas.id, id), isNull(pessoas.deleted_at)))
  }
}
