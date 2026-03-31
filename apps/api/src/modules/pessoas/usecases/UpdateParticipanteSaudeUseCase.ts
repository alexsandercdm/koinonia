import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export class UpdateParticipanteSaudeUseCase {
  constructor(private db: Database) {}

  async execute(id: string, data: Partial<{
    alergias: string
    restricoes_alimentares: string[]
    medicamentos: string
    condicoes_medicas: string
    contato_emergencia_nome: string
    contato_emergencia_tel: string
  }>) {
    const [participante] = await this.db.update(pessoas)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(and(eq(pessoas.id, id), isNull(pessoas.deleted_at)))
      .returning()

    return participante
  }
}
