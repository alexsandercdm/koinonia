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

  console.log('🔄 Executando migrations no banco de Teste...')
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 })
  const db = drizzle(migrationClient)

  await migrate(db, { migrationsFolder: 'drizzle' })
  
  await migrationClient.end()
  console.log('✅ Migrations concluídas com sucesso no banco de testes!')
}

runMigrate().catch((err) => {
  console.error('❌ Erro nas migrations do banco de testes:', err)
  process.exit(1)
})
