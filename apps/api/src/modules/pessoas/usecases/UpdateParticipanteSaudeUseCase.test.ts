import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { db } from '../../../db'
import { schema } from '../../../db'
import { eq } from 'drizzle-orm'

describe('UpdateParticipanteSaudeUseCase (Integração E2E com Audit Log)', () => {
  let app: FastifyInstance
  let createdId: string
  let liderToken: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3006 })
    } catch {
      // Ignore if already listening
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function setupAuth() {
    const email = 'lider_saude@example.com'
    await fetch('http://localhost:3006/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: 'Test Lider' })
    })

    await db.update(schema.user).set({ role: 'lider' }).where(eq(schema.user.email, email))

    const signInResponse = await fetch('http://localhost:3006/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    })

    const body = await signInResponse.json() as any
    liderToken = body.token
  }

  beforeEach(async () => {
    await clearDatabase()
    await setupAuth()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { 
        nome: 'Fernanda', 
        genero: 'F', 
        email: 'fenanda@test.com',
        alergias: 'Camarão'
      }
    })
    
    createdId = response.json().id
  })

  it('deve atualizar dados de saúde e registrar no audit_logs', async () => {
    const patchResp = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${createdId}/saude`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        medicamentos: 'Dipirona',
        restricoes_alimentares: ['Lactose', 'Glúten']
      }
    })

    expect(patchResp.statusCode).toBe(200)
    const updatedParticipante = patchResp.json()
    expect(updatedParticipante.medicamentos).toBe('Dipirona')

    const getResp = await app.inject({
      method: 'GET',
      url: `/api/v1/participantes/${createdId}`,
      headers: { authorization: `Bearer ${liderToken}` },
    })
    expect(getResp.json().alergias).toBe('Camarão')
    expect(getResp.json().medicamentos).toBe('Dipirona')
    expect(getResp.json().restricoes_alimentares).toEqual(['Lactose', 'Glúten'])

    // Verify Audit Log
    const logs = await db.select().from(schema.auditLogs).where(eq(schema.auditLogs.target_id, createdId))
    expect(logs.length).toBe(1)
    expect(logs[0].action).toBe('UPDATE_HEALTH')
    
    const changes = logs[0].changes as any
    expect(changes.medicamentos).toBe('Dipirona')
    expect(changes.restricoes_alimentares).toEqual(['Lactose', 'Glúten'])
  })
})
