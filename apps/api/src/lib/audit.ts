import { FastifyInstance } from 'fastify'
import { db } from '../db'
import { auditLogs } from '../db/schema'

interface LogActionParams {
  userId: string
  targetId: string
  action: string
  changes?: Record<string, unknown>
}

export async function logAction(
  _fastify: FastifyInstance | null,
  params: LogActionParams,
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      user_id: params.userId,
      target_id: params.targetId,
      action: params.action,
      changes: params.changes ?? null,
    })
  } catch (err) {
    // Non-fatal: audit failures must not break business operations
    console.error('[audit] logAction failed:', err)
  }
}
