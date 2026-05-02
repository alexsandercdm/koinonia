import { describe, expect, it, vi } from 'vitest'
import { PessoasRepository } from './PessoasRepository'
import { OrgRole, type TenantContext } from '../../../lib/tenant/types'

const ctx: TenantContext = {
  orgId: 'default-org-koinonia-seed',
  userId: 'test-user',
  userRole: OrgRole.PRESIDENTE,
}

describe('PessoasRepository.findSubtree', () => {
  it('returns empty array for unknown pessoaId', async () => {
    const db = {
      execute: vi.fn().mockResolvedValue([]),
    }

    const repo = new PessoasRepository(db as any, ctx)
    const result = await repo.findSubtree('00000000-0000-0000-0000-000000000000')

    expect(result).toEqual([])
  })
})
