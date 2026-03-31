import { Database } from '../../../db'
import { pessoas } from '../../../db/schema'
import { ilike, and, isNull } from 'drizzle-orm'

interface ListParticipantesParams {
  q?: string
  page: number
  pageSize: number
}

export class ListParticipantesUseCase {
  constructor(private db: Database) {}

  async execute({ q, page, pageSize }: ListParticipantesParams) {
    const offset = (page - 1) * pageSize

    const conditions = [
      isNull(pessoas.deleted_at)
    ]

    if (q) {
      conditions.push(
        ilike(pessoas.nome, `%${q}%`)
      )
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]

    const [participantes, total] = await Promise.all([
      this.db.select()
        .from(pessoas)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(pessoas.nome),
      this.db.select({ count: pessoas.id })
        .from(pessoas)
        .where(whereClause)
        .then(result => result.length)
    ])

    return {
      data: participantes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }
}
