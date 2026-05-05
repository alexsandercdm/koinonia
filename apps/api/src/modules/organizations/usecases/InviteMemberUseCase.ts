import { auth } from '../../../config/auth'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform } from '../../../lib/tenant/permission-resolver'
import { Operation, type OrgRole, type TenantContext } from '../../../lib/tenant/types'
import type { AuthRequestHeaders } from './auth-request-headers'

export class InviteMemberUseCase {
  constructor(private ctx: TenantContext) {}

  async execute(email: string, role: OrgRole, requestHeaders: AuthRequestHeaders) {
    if (!canPerform(this.ctx.userRole, Operation.INVITE_MEMBER)) {
      throw new TenantForbiddenError(Operation.INVITE_MEMBER)
    }

    return auth.api.createInvitation({
      body: { email, role, organizationId: this.ctx.orgId },
      headers: requestHeaders as any,
    })
  }
}
