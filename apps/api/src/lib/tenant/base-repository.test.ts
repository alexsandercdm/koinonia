import { describe, expect, it } from 'vitest'
import { BaseRepository } from './base-repository'
import { MissingTenantContextError } from './errors'
import { OrgRole, type TenantContext } from './types'

class TestRepo extends BaseRepository {
  getOrgId() {
    return this.orgId
  }

  testWhereOrg() {
    return this.whereOrg({ organization_id: 'any' as never })
  }

  testWithOrg() {
    return this.withOrg({ nome: 'Test' })
  }
}

const validCtx: TenantContext = {
  orgId: 'org-abc',
  userId: 'user-1',
  userRole: OrgRole.MEMBRO,
}

describe('BaseRepository', () => {
  it('stores orgId from valid ctx', () => {
    expect(new TestRepo({} as never, validCtx).getOrgId()).toBe('org-abc')
  })

  it('throws MissingTenantContextError when orgId is empty string', () => {
    expect(() => new TestRepo({} as never, { ...validCtx, orgId: '' })).toThrow(MissingTenantContextError)
  })

  it('throws MissingTenantContextError when ctx is null', () => {
    expect(() => new TestRepo({} as never, null as never)).toThrow(MissingTenantContextError)
  })

  it('withOrg injects organization_id', () => {
    const repo = new TestRepo({} as never, validCtx)

    expect(repo.testWithOrg()).toMatchObject({
      nome: 'Test',
      organization_id: 'org-abc',
    })
  })
})
