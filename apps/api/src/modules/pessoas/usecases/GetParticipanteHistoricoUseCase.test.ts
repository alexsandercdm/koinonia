import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('GetParticipanteHistoricoUseCase (Integração E2E)', () => {
  let app: FastifyInstance
  let createdId: string

  beforeAll(async () => {
    app = buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await clearDatabase()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Elena', genero: 'F', email: 'elena@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve retornar 200 e trazer o histórico do participante', async () => {
    const response = await app.inject({
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
