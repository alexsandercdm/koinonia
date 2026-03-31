import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../app'
import { db, schema } from '../db'
import { eq } from 'drizzle-orm'
import * as fs from 'fs'

describe('Authentication E2E', { timeout: 30000 }, () => {
  const app = buildApp()
  let baseUrl: string

  beforeAll(async () => {
    // Fixed port to match .env.test
    baseUrl = `http://localhost:3005`
    await app.listen({ port: 3005 })
  })

  afterAll(async () => {
    await app.close()
  })

  async function clearAuthTables() {
    // Ordem importa por causa de FKs raras no Better Auth, mas limpamos tudo
    await db.delete(schema.session)
    await db.delete(schema.account)
    await db.delete(schema.user)
  }

  beforeEach(async () => {
    await clearAuthTables()
  })

  it('should sign up a new user', async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      })
    })

    const body = (await response.json()) as any
    if (response.status !== 200) {
      throw new Error(`Signup Fail: ${JSON.stringify(body)}`)
    }
    expect(response.status).toEqual(200)
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe('test@example.com')

    // Verificar no banco
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, 'test@example.com')
    })
    expect(user).toBeDefined()
    expect(user?.name).toBe('Test User')
  })

  it('should sign in an existing user', async () => {
    // Primeiro cadastrar
    await fetch(`${baseUrl}/api/v1/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'signin@example.com',
        password: 'Password123!',
        name: 'Sign In User'
      })
    })

    const response = await fetch(`${baseUrl}/api/v1/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'signin@example.com',
        password: 'Password123!'
      })
    })

    const body = (await response.json()) as any
    fs.appendFileSync('/tmp/auth_debug.log', `Signin Response: ${JSON.stringify(body, null, 2)}\n`)
    if (response.status !== 200) {
      throw new Error(`Signin Fail: ${JSON.stringify(body)}`)
    }
    expect(response.status).toEqual(200)
    // In Better Auth v1, it might return token instead of session in the response body
    expect(body.token || body.session).toBeDefined()
    expect(body.user.email).toBe('signin@example.com')

    // Verificar se set-cookie existe
    expect(response.headers.get('set-cookie')).toBeDefined()

    // Assert that session is persisted in the database
    const sessions = await db.select().from(schema.session)
    expect(sessions.length).toBeGreaterThan(0)
  })

  it('should sign out successfully', async () => {
    // Cadastrar e logar
    await fetch(`${baseUrl}/api/v1/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'signout@example.com',
        password: 'Password123!',
        name: 'Sign Out User'
      })
    })

    const signInResponse = await fetch(`${baseUrl}/api/v1/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'signout@example.com',
        password: 'Password123!'
      })
    })

    const signInBody = (await signInResponse.json()) as any
    const cookie = signInResponse.headers.get('set-cookie')
    const token = signInBody.token
    
    fs.appendFileSync('/tmp/auth_debug.log', `Signout Attempt - Token: ${token}, Cookie: ${cookie}\n`)

    const response = await fetch(`${baseUrl}/api/v1/auth/sign-out`, {
      method: 'POST',
      headers: {
        cookie: cookie || '',
        authorization: token ? `Bearer ${token}` : ''
      }
    })

    const signoutBody = await response.text()
    fs.appendFileSync('/tmp/auth_debug.log', `Signout Response: ${response.status} - ${signoutBody}\n`)

    expect(response.status).toBe(200)
    
    // Verificar se a sessão foi removida no banco
    const sessions = await db.select().from(schema.session)
    expect(sessions.length).toBe(0)
  })
})
