import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../app'
import { db } from '../db'
import { sql } from 'drizzle-orm'
import { signInWithActiveOrg } from './helpers/authWithOrg'

describe('RBAC E2E', { timeout: 30000 }, () => {
  const app = buildApp()
  const baseUrl = `http://localhost:3005`

  beforeAll(async () => {
    try {
      await app.listen({ port: 3005 })
    } catch (err) {
      // Ignore if already listening
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function clearTables() {
    await db.execute(sql`
      TRUNCATE TABLE
        audit_logs,
        pessoas,
        invitation,
        member,
        organization,
        session,
        account,
        verification,
        "user"
      RESTART IDENTITY CASCADE;
    `)
  }

  beforeEach(async () => {
    await clearTables()
  })

  async function getAuthToken(email: string, role: string = 'servo') {
    return signInWithActiveOrg({
      baseUrl,
      email,
      name: 'Test User',
      role: role as 'admin' | 'lider' | 'servo',
    })
  }

  it('should allow LIDER to list participants', async () => {
    const token = await getAuthToken('lider@example.com', 'lider')
    
    const response = await fetch(`${baseUrl}/api/v1/participantes`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })

  it('should allow SERVO to list participants', async () => {
    const token = await getAuthToken('servo@example.com', 'servo')
    
    const response = await fetch(`${baseUrl}/api/v1/participantes`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })

  it('should deny SERVO to create participant', async () => {
    const token = await getAuthToken('servo_create@example.com', 'servo')
    
    const response = await fetch(`${baseUrl}/api/v1/participantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Test Post',
        genero: 'M'
      })
    })

    expect(response.status).toBe(403)
  })

  it('should allow LIDER to create participant', async () => {
    const token = await getAuthToken('lider_create@example.com', 'lider')
    
    const response = await fetch(`${baseUrl}/api/v1/participantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nome: 'Test Lider Post',
        genero: 'M'
      })
    })

    expect(response.status).toBe(201)
  })

  it('should deny LIDER to delete participant', async () => {
    const token = await getAuthToken('lider_delete@example.com', 'lider')
    const id = '00000000-0000-0000-0000-000000000000'
    
    const response = await fetch(`${baseUrl}/api/v1/participantes/${id}`, {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(403)
  })

  it('should deny unauthenticated user to list participants', async () => {
    const response = await fetch(`${baseUrl}/api/v1/participantes`)

    expect(response.status).toBe(401)
  })

  it('should allow ADMIN to list participants', async () => {
    const token = await getAuthToken('admin@example.com', 'admin')
    
    const response = await fetch(`${baseUrl}/api/v1/participantes`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(response.status).toBe(200)
  })
})
