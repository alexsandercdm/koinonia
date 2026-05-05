import { eq } from 'drizzle-orm'
import { type Database } from '../../../db'
import { member, user } from '../../../db/schema'
import type { TenantContext } from '../../../lib/tenant/types'

export class GetMembersUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute() {
    return this.db
      .select({
        memberId: member.id,
        userId: member.userId,
        role: member.role,
        name: user.name,
        email: user.email,
        joinedAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(member.organizationId, this.ctx.orgId))
  }
}
