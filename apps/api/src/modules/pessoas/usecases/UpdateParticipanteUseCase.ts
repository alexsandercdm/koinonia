import { and, eq, isNull, ne } from 'drizzle-orm'
import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { AuditLogRepository } from '../repositories/AuditLogRepository'

export type UpdateParticipanteData = Partial<{
  nome: string
  genero: string
  data_nascimento: string
  telefone: string
  email: string
  padrinho_id: string | null
  alergias: string
  restricoes_alimentares: string[]
  medicamentos: string
  condicoes_medicas: string
  contato_emergencia_nome: string
  contato_emergencia_tel: string
}>

export class UpdateParticipanteUseCase {
  constructor(private db: Database, private auditLogRepo: AuditLogRepository) {}

  async execute(id: string, user_id: string, data: UpdateParticipanteData) {
    if (data.email) {
      const existing = await this.db.select()
        .from(pessoas)
        .where(and(eq(pessoas.email, data.email), ne(pessoas.id, id)))
        .limit(1)

      if (existing.length > 0) {
        throw new Error('Email already exists')
      }
    }

    if (data.telefone) {
      const existing = await this.db.select()
        .from(pessoas)
        .where(and(eq(pessoas.telefone, data.telefone), ne(pessoas.id, id)))
        .limit(1)

      if (existing.length > 0) {
        throw new Error('Phone already exists')
      }
    }

    const [participante] = await this.db.update(pessoas)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(and(eq(pessoas.id, id), isNull(pessoas.deleted_at)))
      .returning()

    if (!participante) {
      throw new Error('Participante not found')
    }

    await this.auditLogRepo.logAction({
      user_id,
      target_id: id,
      action: 'UPDATE_PARTICIPANT',
      changes: data as any,
    })

    return participante
  }
}
