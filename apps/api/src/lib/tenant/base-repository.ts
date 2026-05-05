import { eq, type AnyColumn } from 'drizzle-orm'
import type { Database } from '../../db'
import { MissingTenantContextError } from './errors'
import type { TenantContext } from './types'

export abstract class BaseRepository {
  protected readonly orgId: string

  constructor(
    protected readonly db: Database,
    ctx: TenantContext,
  ) {
    if (!ctx?.orgId) {
      throw new MissingTenantContextError()
    }

    this.orgId = ctx.orgId
  }

  protected whereOrg(table: { organization_id: AnyColumn }) {
    return eq(table.organization_id, this.orgId)
  }

  protected withOrg<T extends Record<string, unknown>>(data: T): T & { organization_id: string } {
    return {
      ...data,
      organization_id: this.orgId,
    }
  }
}
