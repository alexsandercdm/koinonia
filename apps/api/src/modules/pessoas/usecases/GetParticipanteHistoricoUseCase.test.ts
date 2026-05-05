import { eq } from 'drizzle-orm'
import { schema } from '../../../db'
import { db } from '../../../db'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { signInWithActiveOrg } from '../../../tests/helpers/authWithOrg'

describe('GetParticipanteHistoricoUseCase (Integração E2E)', () => {
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
    adminToken = await signInWithActiveOrg({
      baseUrl: 'http://localhost:3005',
      email,
      name: 'Admin',
      role: 'admin',
    })
  }

  beforeEach(async () => {
    await clearDatabase()
    await setupAuth()

    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Elena', genero: 'F', email: 'elena@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve retornar 200 e trazer o histórico do participante', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: `/api/v1/participantes/${createdId}/historico`
    })

    expect(response.statusCode).toBe(200)
    
    const body = response.json()
    expect(Array.isArray(body)).toBe(true)
    // Inicialmente não atrelamos eventos/inscrições ao setup deste participante
    expect(body.length).toBe(0)
  })
})
