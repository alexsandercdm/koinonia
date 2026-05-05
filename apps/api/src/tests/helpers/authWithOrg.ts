import { eq } from 'drizzle-orm'
import { db, schema } from '../../db'

interface AuthWithOrgInput {
  baseUrl: string
  email: string
  password?: string
  name?: string
  role?: 'admin' | 'lider' | 'servo'
}

async function expectOk(response: Response, action: string) {
  if (response.ok) {
    return
  }

  const body = await response.text()
  throw new Error(`${action} failed: ${response.status} ${body}`)
}

export async function signInWithActiveOrg({
  baseUrl,
  email,
  password = 'Password123!',
  name = 'Test User',
  role = 'servo',
}: AuthWithOrgInput) {
  const signUpResponse = await fetch(`${baseUrl}/api/v1/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  await expectOk(signUpResponse, 'signup')

  await db.update(schema.user)
    .set({ role })
    .where(eq(schema.user.email, email))

  const signInResponse = await fetch(`${baseUrl}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  await expectOk(signInResponse, 'signin')

  const signInBody = await signInResponse.json() as any
  const token = signInBody.token as string
  if (!token) {
    throw new Error(`signin did not return a bearer token: ${JSON.stringify(signInBody)}`)
  }

  const createOrganizationResponse = await fetch(`${baseUrl}/api/v1/organization`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `${name} Org`,
      slug: `org-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),
  })
  await expectOk(createOrganizationResponse, 'create organization')

  return token
}
