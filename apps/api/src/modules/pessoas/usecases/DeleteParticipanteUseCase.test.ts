import { eq } from 'drizzle-orm'
import { schema } from '../../../db'
import { db } from '../../../db'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('DeleteParticipanteUseCase (Integração E2E)', () => {
  let app: FastifyInstance
  let createdId: string

  beforeAll(async () => {
    app = buildApp()
    try { await app.listen({ port: 3005 }) } catch {}
  })

  afterAll(async () => {
    await app.close()
  })

  let adminToken: string
  async function setupAuth() {
    const email = 'admin_' + Date.now() + Math.random().toString(36).substring(7) + '@example.com'
    await fetch('http://localhost:3005/api/v1/auth/sign-up/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Password123!', name: 'Admin' }) })
    await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.email, email))
    const res = await fetch('http://localhost:3005/api/v1/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Password123!' }) })
    const body = await res.json()
    adminToken = body.token
  }

  beforeEach(async () => {
    await clearDatabase()
    await setupAuth()

    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Daniel', genero: 'M', email: 'daniel@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve realizar soft delete de um participante, retornando 204', async () => {
    const deleteResp = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'DELETE',
      url: `/api/v1/participantes/${createdId}`
    })

    expect(deleteResp.statusCode).toBe(204)

    // Verifica que nao vem mais na listagem default (pois isNull(deleted_at))
    const listResp = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: '/api/v1/participantes'
    })
    
    expect(listResp.json().data.length).toBe(0)
  })
})
