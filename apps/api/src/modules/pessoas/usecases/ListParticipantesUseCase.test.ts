import { eq } from 'drizzle-orm'
import { schema } from '../../../db'
import { db } from '../../../db'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('ListParticipantesUseCase (Integração E2E)', () => {
  let app: FastifyInstance

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

    // Insere massa de dados inicial
    await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Alice Alves', genero: 'F', email: 'alice@test.com' }
    })
    await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Bob Batista', genero: 'M', email: 'bob@test.com' }
    })
  })

  it('deve listar todos os participantes com paginação padrão', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: '/api/v1/participantes'
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    
    expect(body.data.length).toBe(2)
    // Ordem alfabética pelo nome (depende do use case)
    expect(body.data[0].nome).toBe('Alice Alves')
    expect(body.pagination.total).toBe(2)
  })

  it('deve filtrar participantes por query (q=Alice)', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: '/api/v1/participantes?q=Alice'
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    
    expect(body.data.length).toBe(1)
    expect(body.data[0].nome).toBe('Alice Alves')
    expect(body.pagination.total).toBe(1)
  })
})
