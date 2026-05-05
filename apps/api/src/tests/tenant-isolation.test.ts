import { describe, it, expect, beforeAll } from 'vitest'
import { db, schema } from '../db'
import { sql, and, eq } from 'drizzle-orm'
import { PessoasRepository } from '../modules/pessoas/repositories/PessoasRepository'
import { EventoRepository } from '../modules/inscricoes/repositories/EventoRepository'
import { MissingTenantContextError } from '../lib/tenant/errors'
import { OrgRole, type TenantContext } from '../lib/tenant/types'

const ORG_A = 'test-org-a-isolation'
const ORG_B = 'test-org-b-isolation'

const ctxA: TenantContext = { orgId: ORG_A, userId: 'user-a', userRole: OrgRole.PRESIDENTE }
const ctxB: TenantContext = { orgId: ORG_B, userId: 'user-b', userRole: OrgRole.PRESIDENTE }

beforeAll(async () => {
  await db.execute(sql`
    INSERT INTO organization (id, name, slug, created_at, updated_at)
    VALUES
      (${ORG_A}, 'Org A', 'org-a-iso-test', now(), now()),
      (${ORG_B}, 'Org B', 'org-b-iso-test', now(), now())
    ON CONFLICT (id) DO NOTHING
  `)
})

// INV-01: queries scoped to orgId
describe('INV-01: queries return only own-org data', () => {
  it('PessoasRepository.list excludes other org rows', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const repoB = new PessoasRepository(db, ctxB)
    const pessoaA = await repoA.create({ nome: 'Pessoa Org A', genero: 'M' })

    const listA = await repoA.list({ page: 1, pageSize: 100 })
    const listB = await repoB.list({ page: 1, pageSize: 100 })

    expect(listA.data.some((p) => p.id === pessoaA.id)).toBe(true)
    expect(listB.data.some((p) => p.id === pessoaA.id)).toBe(false)
  })
})

// INV-02: FK compostas prevent cross-tenant references
describe('INV-02: FK compostas block cross-org references', () => {
  it('cannot insert inscricao referencing evento from another org', async () => {
    const pessoaRepoA = new PessoasRepository(db, ctxA)
    const eventoRepoB = new EventoRepository(db, ctxB)

    const pessoaA = await pessoaRepoA.create({ nome: 'Inscrito A', genero: 'F' })
    const eventoB = await eventoRepoB.create({
      nome: 'Evento B',
      data_inicio: '2026-06-01' as any,
      data_fim: '2026-06-03' as any,
      capacidade_maxima: 50,
    })

    // Raw insert to bypass app-level guard — should fail on DB FK composta
    await expect(
      db.execute(sql`
        INSERT INTO inscricoes (id, organization_id, evento_id, pessoa_id, papel, valor_total, status)
        VALUES (gen_random_uuid(), ${ORG_A}, ${eventoB.id}, ${pessoaA.id}, 'encontrista', 100, 'PENDENTE')
      `)
    ).rejects.toThrow()
  })
})

// INV-05: lider_pessoa_id must be in same org
describe('INV-05: lider_pessoa_id constrained to same org', () => {
  it('throws FK error when assigning leader from different org', async () => {
    const repoA = new PessoasRepository(db, ctxA)
    const repoB = new PessoasRepository(db, ctxB)
    const liderB = await repoB.create({ nome: 'Lider B', genero: 'M' })

    await expect(
      repoA.create({ nome: 'Liderado A', genero: 'F', lider_pessoa_id: liderB.id })
    ).rejects.toThrow()
  })
})

// INV-06: no self-leadership
describe('INV-06: pessoa cannot be their own leader', () => {
  it('throws CHECK violation on self-leadership', async () => {
    const repo = new PessoasRepository(db, ctxA)
    const pessoa = await repo.create({ nome: 'Auto Lider', genero: 'M' })
    await expect(repo.update(pessoa.id, { lider_pessoa_id: pessoa.id })).rejects.toThrow()
  })
})

// INV-09: BaseRepository guard
describe('INV-09: BaseRepository requires orgId', () => {
  it('throws MissingTenantContextError when orgId is empty', () => {
    expect(() => new PessoasRepository(db, { ...ctxA, orgId: '' }))
      .toThrow(MissingTenantContextError)
  })
  it('throws MissingTenantContextError when ctx is null', () => {
    expect(() => new PessoasRepository(db, null as any))
      .toThrow(MissingTenantContextError)
  })
})
