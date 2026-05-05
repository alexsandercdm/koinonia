import { eq } from 'drizzle-orm'
import { schema } from '../../../db'
import { db } from '../../../db'
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { signInWithActiveOrg } from '../../../tests/helpers/authWithOrg'

describe('GetParticipanteByIdUseCase (Integração E2E)', () => {
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
      payload: { nome: 'Carlos', genero: 'M', email: 'carlos@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve retornar 200 e os dados do participante existente', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: `/api/v1/participantes/${createdId}`
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().nome).toBe('Carlos')
  })

  it('deve retornar 404 para participante que não existe', async () => {
    // Gerando um UUID fake que não tem no banco
    const fakeUuid = '00000000-0000-0000-0000-000000000000'
    const response = await app.inject({
      headers: { authorization: `Bearer ${adminToken}` },
      method: 'GET',
      url: `/api/v1/participantes/${fakeUuid}`
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('Participante not found')
  })
})
