import { access } from 'node:fs/promises'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.test') })

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env.test')
  }

  const migrationsFolder = path.resolve(process.cwd(), 'drizzle')
  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')

  try {
    await access(journalPath)
  } catch {
    throw new Error(
      [
        `Drizzle migration journal not found at ${journalPath}.`,
        'This repository no longer has a tracked Drizzle migration history for bootstrapping a fresh test database.',
        'Before running db:test:migrate, provision the baseline schema for koinonia_test or restore the missing Drizzle journal.',
      ].join(' '),
    )
  }

  console.log('🔄 Executando migrations no banco de Teste...')
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 })
  const db = drizzle(migrationClient)

  await migrate(db, { migrationsFolder })
  
  await migrationClient.end()
  console.log('✅ Migrations concluídas com sucesso no banco de testes!')
}

runMigrate().catch((err) => {
  console.error('❌ Erro nas migrations do banco de testes:', err)
  process.exit(1)
})
