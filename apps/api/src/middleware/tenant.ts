import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { and, eq } from 'drizzle-orm'
import { auth } from '../config/auth'
import { db } from '../db'
import { member } from '../db/schema'
import { MissingTenantContextError } from '../lib/tenant/errors'
import type { OrgRole, TenantContext } from '../lib/tenant/types'

declare module 'fastify' {
  interface FastifyRequest {
    tenantCtx?: TenantContext
  }
}

const SUSPICIOUS_ORG_HEADERS = ['x-org-id', 'x-organization-id', 'organization-id'] as const

const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request: FastifyRequest, _reply: FastifyReply) => {
    for (const header of SUSPICIOUS_ORG_HEADERS) {
      if (request.headers[header]) {
        request.log.warn(
          { event: 'suspicious_tenant_header', header, ip: request.ip },
          'Client attempted to set org via header - ignored',
        )
      }
    }

    const body = request.body
    if (body && typeof body === 'object' && !Array.isArray(body) && 'organization_id' in body) {
      request.log.warn(
        { event: 'suspicious_tenant_body', ip: request.ip },
        'Client sent organization_id in body - ignored for tenant resolution',
      )
    }

    let sessionResult: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
    try {
      sessionResult = await auth.api.getSession({ headers: request.headers as any })
    } catch {
      return
    }

    if (!sessionResult) return

    const activeOrganizationId = sessionResult.session?.activeOrganizationId
    if (!activeOrganizationId) return

    const userId = sessionResult.user.id
    const [membership] = await db
      .select({ role: member.role })
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, activeOrganizationId)))
      .limit(1)

    if (!membership) {
      request.log.warn(
        { event: 'stale_active_org', userId, activeOrganizationId },
        'User has active org but is not a member - clearing context',
      )
      return
    }

    request.tenantCtx = {
      orgId: activeOrganizationId,
      userId,
      userRole: membership.role as OrgRole,
    }
  })
}

export const tenantMiddleware = fp(tenantPlugin)

export function requireTenantCtx(request: FastifyRequest, reply: FastifyReply): TenantContext {
  if (!request.tenantCtx) {
    reply.code(401).send({
      error: 'No active organization. Call POST /api/v1/auth/organization/set-active first.',
    })
    throw new MissingTenantContextError()
  }

  return request.tenantCtx
}
