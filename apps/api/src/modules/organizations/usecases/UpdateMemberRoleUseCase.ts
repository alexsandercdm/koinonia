import { and, eq } from 'drizzle-orm'
import { type Database } from '../../../db'
import { member } from '../../../db/schema'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform } from '../../../lib/tenant/permission-resolver'
import { Operation, OrgRole, type TenantContext } from '../../../lib/tenant/types'

export class UpdateMemberRoleUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(targetUserId: string, newRole: OrgRole) {
    if (!canPerform(this.ctx.userRole, Operation.UPDATE_MEMBER_ROLE)) {
      throw new TenantForbiddenError(Operation.UPDATE_MEMBER_ROLE)
    }

    if (this.ctx.userRole === OrgRole.PASTOR_PRINCIPAL && newRole === OrgRole.PRESIDENTE) {
      throw new TenantForbiddenError('PASTOR_PRINCIPAL cannot assign PRESIDENTE role')
    }

    const [updated] = await this.db
      .update(member)
      .set({ role: newRole })
      .where(and(eq(member.organizationId, this.ctx.orgId), eq(member.userId, targetUserId)))
      .returning()

    if (!updated) {
      throw new Error('Member not found in this organization')
    }

    return updated
  }
}
