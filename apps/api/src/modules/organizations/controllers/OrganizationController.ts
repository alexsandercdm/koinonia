import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { db } from '../../../db'
import { requireTenantCtx } from '../../../middleware/tenant'
import { OrgRole } from '../../../lib/tenant/types'
import { CreateOrganizationUseCase } from '../usecases/CreateOrganizationUseCase'
import { GetMembersUseCase } from '../usecases/GetMembersUseCase'
import { InviteMemberUseCase } from '../usecases/InviteMemberUseCase'
import { TransferPresidencyUseCase } from '../usecases/TransferPresidencyUseCase'
import { UpdateMemberRoleUseCase } from '../usecases/UpdateMemberRoleUseCase'

const createOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
})

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole).default(OrgRole.MEMBRO),
})

const updateRoleSchema = z.object({
  role: z.nativeEnum(OrgRole),
})

const transferPresidencySchema = z.object({
  newPresidentUserId: z.string(),
})

export class OrganizationController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, slug } = createOrganizationSchema.parse(request.body)
    const org = await new CreateOrganizationUseCase().execute({
      name,
      slug,
      requestHeaders: request.headers as any,
    })
    return reply.code(201).send(org)
  }

  async getMembers(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    return reply.send(await new GetMembersUseCase(db, ctx).execute())
  }

  async inviteMember(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { email, role } = inviteMemberSchema.parse(request.body)
    const result = await new InviteMemberUseCase(ctx).execute(email, role, request.headers as any)
    return reply.code(201).send(result)
  }

  async updateMemberRole(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { userId } = request.params as { userId: string }
    const { role } = updateRoleSchema.parse(request.body)
    return reply.send(await new UpdateMemberRoleUseCase(db, ctx).execute(userId, role))
  }

  async transferPresidency(request: FastifyRequest, reply: FastifyReply) {
    const ctx = requireTenantCtx(request, reply)
    const { newPresidentUserId } = transferPresidencySchema.parse(request.body)
    await new TransferPresidencyUseCase(db, ctx).execute(newPresidentUserId)
    return reply.code(204).send()
  }
}
