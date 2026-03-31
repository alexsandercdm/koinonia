import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { CreatePessoa } from '../entities/pessoa'

export class CreateParticipanteUseCase {
  constructor(private db: Database) {}

  async execute(data: CreatePessoa) {
    // Check if email already exists
    if (data.email) {
      const existing = await this.db.select()
        .from(pessoas)
        .where(eq(pessoas.email, data.email))
        .limit(1)
      
      if (existing.length > 0) {
        throw new Error('Email already exists')
      }
    }

    // Check if phone already exists
    if (data.telefone) {
      const existing = await this.db.select()
        .from(pessoas)
        .where(eq(pessoas.telefone, data.telefone))
        .limit(1)
      
      if (existing.length > 0) {
        throw new Error('Phone already exists')
      }
    }

    // Create participant
    const [participante] = await this.db.insert(pessoas)
      .values(data)
      .returning()

    return participante
  }
}
