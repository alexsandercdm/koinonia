import { DEFAULT_ORGANIZATION_ID } from '../../../db/default-organization'
import { OrgRole, type TenantContext } from '../../../lib/tenant/types'

export function resolveTenantContext(ctx?: TenantContext): TenantContext {
  return ctx ?? {
    orgId: DEFAULT_ORGANIZATION_ID,
    userId: 'system',
    userRole: OrgRole.PRESIDENTE,
  }
}
