import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const DEFAULT_ORG_ID = 'default-org-koinonia-seed'
const DEFAULT_ORG_NAME = 'Igreja Padrão'
const DEFAULT_ORG_SLUG = 'igreja-padrao'

const tenantTables = ['pessoas', 'eventos', 'inscricoes', 'locais'] as const

function getAffectedRows(result: unknown) {
  const maybeResult = result as { rowCount?: number; count?: number }
  return maybeResult.rowCount ?? maybeResult.count ?? '?'
}

async function backfill() {
  console.log('Starting backfill...')

  await db.execute(sql`
    INSERT INTO "organization" ("id", "name", "slug", "created_at", "updated_at")
    VALUES (
      ${DEFAULT_ORG_ID},
      ${DEFAULT_ORG_NAME},
      ${DEFAULT_ORG_SLUG},
      now(),
      now()
    )
    ON CONFLICT ("id") DO UPDATE
      SET "name" = EXCLUDED."name",
          "slug" = EXCLUDED."slug",
          "updated_at" = now()
  `)
  console.log(`  organization: seeded (id=${DEFAULT_ORG_ID})`)

  for (const table of tenantTables) {
    const result = await db.execute(sql`
      UPDATE ${sql.raw(`"${table}"`)}
      SET "organization_id" = ${DEFAULT_ORG_ID}
      WHERE "organization_id" IS NULL
    `)

    console.log(`  ${table}: updated ${getAffectedRows(result)} rows`)
  }

  console.log('Backfill complete.')
}

backfill()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Backfill failed:', error)
    process.exit(1)
  })
