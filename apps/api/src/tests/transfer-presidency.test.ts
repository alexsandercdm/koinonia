import { describe, it, expect, beforeAll } from 'vitest'
import { db, schema } from '../db'
import { sql } from 'drizzle-orm'
import { TransferPresidencyUseCase } from '../modules/organizations/usecases/TransferPresidencyUseCase'
import { TenantForbiddenError } from '../lib/tenant/errors'
import { OrgRole, type TenantContext } from '../lib/tenant/types'

const ORG_ID = 'test-org-transfer-pres'
const PRESIDENT_ID = 'president-user-transfer'
const TARGET_ID = 'target-user-transfer'

beforeAll(async () => {
  await db.execute(sql`
    INSERT INTO organization (id, name, slug, created_at, updated_at)
    VALUES (${ORG_ID}, 'Transfer Org', 'transfer-org-test', now(), now())
    ON CONFLICT (id) DO NOTHING
  `)
  await db.execute(sql`
    INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
    VALUES
      (${PRESIDENT_ID}, 'Presidente', 'pres@transfer.test', true, now(), now()),
      (${TARGET_ID},    'Target',     'tgt@transfer.test',  true, now(), now())
    ON CONFLICT (id) DO NOTHING
  `)
  await db.execute(sql`
    DELETE FROM member WHERE organization_id = ${ORG_ID}
  `)
  await db.execute(sql`
    INSERT INTO member (id, user_id, organization_id, role, created_at)
    VALUES
      (gen_random_uuid(), ${PRESIDENT_ID}, ${ORG_ID}, 'PRESIDENTE', now()),
      (gen_random_uuid(), ${TARGET_ID},    ${ORG_ID}, 'PASTOR_PRINCIPAL', now())
  `)
})

const presCtx: TenantContext = { orgId: ORG_ID, userId: PRESIDENT_ID, userRole: OrgRole.PRESIDENTE }

describe('TransferPresidencyUseCase', () => {
  it('transfers presidency atomically', async () => {
    await new TransferPresidencyUseCase(db, presCtx).execute(TARGET_ID)

    const rows = await db.execute(sql`
      SELECT user_id, role FROM member WHERE organization_id = ${ORG_ID}
    `) as any[]

    const roles = Object.fromEntries(rows.map((r: any) => [r.user_id, r.role]))
    expect(roles[TARGET_ID]).toBe('PRESIDENTE')
    expect(roles[PRESIDENT_ID]).toBe('PASTOR_PRINCIPAL')
  })

  it('throws TenantForbiddenError when non-president attempts transfer', async () => {
    const nonPresCtx: TenantContext = { orgId: ORG_ID, userId: TARGET_ID, userRole: OrgRole.PASTOR_PRINCIPAL }
    await expect(
      new TransferPresidencyUseCase(db, nonPresCtx).execute(PRESIDENT_ID)
    ).rejects.toThrow(TenantForbiddenError)
  })

  it('partial index prevents two PRESIDENTEs simultaneously', async () => {
    await expect(
      db.execute(sql`
        INSERT INTO member (id, user_id, organization_id, role, created_at)
        VALUES (gen_random_uuid(), ${PRESIDENT_ID}, ${ORG_ID}, 'PRESIDENTE', now())
      `)
    ).rejects.toThrow()
  })

  it('throws when target is not a member', async () => {
    const ctx: TenantContext = { orgId: ORG_ID, userId: TARGET_ID, userRole: OrgRole.PRESIDENTE }
    await expect(
      new TransferPresidencyUseCase(db, ctx).execute('non-existent-user')
    ).rejects.toThrow('not a member')
  })
})
