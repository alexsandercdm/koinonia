import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import postgres from 'postgres'

async function main() {
  const migrationPath = process.argv.slice(2).find((arg) => arg !== '--')
  if (!migrationPath) {
    throw new Error('Usage: pnpm db:migrate:manual -- <path-to-sql>')
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const absolutePath = path.resolve(process.cwd(), migrationPath)
  const contents = await readFile(absolutePath, 'utf8')
  const statements = contents
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean)

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })

  try {
    await sql.begin(async (tx) => {
      for (const statement of statements) {
        await tx.unsafe(statement)
      }
    })
  } finally {
    await sql.end()
  }

  console.log(`Applied manual migration: ${migrationPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
