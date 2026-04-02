import { sql } from 'drizzle-orm'
import { db } from '../../db'
import { pessoas, locais, quartos, camas, eventos, inscricoes, pagamentos, despesas } from '../../db/schema'

export async function clearDatabase() {
  // Cascading deletes starting from child tables to avoid foreign key constraints violations
  await db.delete(despesas)
  await db.delete(pagamentos)
  await db.execute(sql`TRUNCATE TABLE configuracao_evento CASCADE;`)
  await db.delete(inscricoes)
  await db.delete(eventos)
  await db.delete(camas)
  await db.delete(quartos)
  await db.delete(locais)
  
  // To avoid self-reference issues with padrinho_id, we can either do a raw TRUNCATE CASCADE
  // or simple delete.
  await db.execute(sql`TRUNCATE TABLE pessoas CASCADE;`)
}
