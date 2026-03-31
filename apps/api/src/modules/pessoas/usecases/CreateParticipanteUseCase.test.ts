import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { db } from '../../../db'
import { schema } from '../../../db'
import { eq } from 'drizzle-orm'
import { pessoas } from '../../../db/schema'

describe('CreateParticipanteUseCase (Integração E2E)', () => {
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
  })

  it('deve criar um participante com sucesso', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: {
        nome: 'João da Silva',
        genero: 'M',
        email: 'joao.silva@example.com',
        telefone: '11999999999'
      }
    })

    expect(response.statusCode).toBe(201)
    const data = response.json()
    expect(data).toHaveProperty('id')
    expect(data.nome).toBe('João da Silva')
    expect(data.email).toBe('joao.silva@example.com')

    // Validar no banco de dados se foi populado
    const userInDb = await db.select().from(pessoas).limit(1)
    expect(userInDb.length).toBe(1)
    expect(userInDb[0].nome).toBe('João da Silva')
  })

  it('não deve criar quando email já existir', async () => {
    // Insere primeiro contato
    await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: {
        nome: 'Maria da Silva',
        genero: 'F',
        email: 'maria.silva@example.com',
      }
    })

    // Tentar criar de novo com o mesmo email
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: {
        nome: 'Maria Clone',
        genero: 'F',
        email: 'maria.silva@example.com',
      }
    })

    expect(response.statusCode).toBe(400) // Assumindo que o controller retorne 400 em business rule validation, check ParticipanteController afterwards.
  })
})
