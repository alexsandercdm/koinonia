import { sql } from 'drizzle-orm'
import { type Database } from '../../../db'
import { TenantForbiddenError } from '../../../lib/tenant/errors'
import { canPerform } from '../../../lib/tenant/permission-resolver'
import { Operation, type TenantContext } from '../../../lib/tenant/types'

export class TransferPresidencyUseCase {
  constructor(
    private db: Database,
    private ctx: TenantContext,
  ) {}

  async execute(newPresidentUserId: string): Promise<void> {
    if (!canPerform(this.ctx.userRole, Operation.TRANSFER_PRESIDENCY)) {
      throw new TenantForbiddenError(Operation.TRANSFER_PRESIDENCY)
    }

    if (this.ctx.userId === newPresidentUserId) {
      throw new Error('Cannot transfer presidency to yourself')
    }

    const { orgId, userId: currentPresidentId } = this.ctx

    await this.db.transaction(async (tx) => {
      await tx.execute(sql`
        UPDATE member
        SET role = 'PASTOR_PRINCIPAL'
        WHERE organization_id = ${orgId}
          AND user_id = ${currentPresidentId}
          AND role = 'PRESIDENTE'
      `)

      const result = await tx.execute(sql`
        UPDATE member
        SET role = 'PRESIDENTE'
        WHERE organization_id = ${orgId}
          AND user_id = ${newPresidentUserId}
      `)

      if ((result as any).count === 0 && (result as any).rowCount === 0) {
        throw new Error('Target user is not a member of this organization')
      }
    })
  }
}
