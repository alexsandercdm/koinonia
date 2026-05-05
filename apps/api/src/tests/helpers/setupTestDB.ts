import { sql } from 'drizzle-orm'
import { db } from '../../db'

export async function clearDatabase() {
  await db.execute(sql`
    TRUNCATE TABLE
      pagamentos,
      despesas,
      inscricoes,
      configuracao_evento,
      eventos,
      camas,
      quartos,
      locais,
      audit_logs,
      pessoas,
      invitation,
      member,
      organization,
      session,
      account,
      verification,
      "user"
    RESTART IDENTITY CASCADE;
  `)
}
