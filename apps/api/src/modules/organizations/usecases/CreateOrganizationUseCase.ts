import { sql } from 'drizzle-orm'
import { auth } from '../../../config/auth'
import { db } from '../../../db'
import type { AuthRequestHeaders } from './auth-request-headers'

interface CreateOrgInput {
  name: string
  slug: string
  requestHeaders: AuthRequestHeaders
}

export class CreateOrganizationUseCase {
  async execute({ name, slug, requestHeaders }: CreateOrgInput) {
    const session = await auth.api.getSession({
      headers: requestHeaders as any,
    })

    const userId = session?.user?.id
    if (!userId) {
      throw new Error('Authenticated user session is required to create an organization')
    }

    const result = await auth.api.createOrganization({
      body: { name, slug },
      headers: requestHeaders as any,
    })

    if (!result || (result as any).error) {
      throw new Error((result as any)?.error?.message ?? 'Failed to create organization')
    }

    const org = (result as any).data ?? result
    const orgId: string = org.id

    await db.execute(sql`
      UPDATE member
      SET role = 'PRESIDENTE'
      WHERE organization_id = ${orgId}
        AND user_id = ${userId}
    `)

    return org
  }
}
