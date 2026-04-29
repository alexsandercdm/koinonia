import { FastifyInstance } from 'fastify'
import { db, schema } from '../../db'
import { eq } from 'drizzle-orm'

const TEST_PORT = 3005
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`

export interface TestAuthSetup {
  adminToken: string
  userEmail: string
}

export async function setupTestAuth(app: FastifyInstance, role: 'admin' | 'lider' | 'servo' = 'admin'): Promise<TestAuthSetup> {
  // Generate unique email to avoid conflicts
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const userEmail = `test_${role}_${timestamp}_${random}@example.com`
  
  // Sign up user
  const signupResponse = await fetch(`${TEST_BASE_URL}/api/v1/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: 'Password123!',
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
    })
  })

  if (!signupResponse.ok) {
    throw new Error(`Signup failed: ${signupResponse.status} ${await signupResponse.text()}`)
  }

  // Update user role in database
  await db.update(schema.user).set({ role }).where(eq(schema.user.email, userEmail))

  // Sign in to get token
  const signinResponse = await fetch(`${TEST_BASE_URL}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail,
      password: 'Password123!'
    })
  })

  if (!signinResponse.ok) {
    throw new Error(`Signin failed: ${signinResponse.status} ${await signinResponse.text()}`)
  }

  const body = (await signinResponse.json()) as { token?: string }
  const token = body.token

  if (!token) {
    throw new Error('No token received from signin')
  }

  return {
    adminToken: token,
    userEmail
  }
}

export function getTestHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export { TEST_PORT, TEST_BASE_URL }
