import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('GetParticipanteByIdUseCase (Integração E2E)', () => {
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
      payload: { nome: 'Carlos', genero: 'M', email: 'carlos@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve retornar 200 e os dados do participante existente', async () => {
    const response = await app.inject({
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
      method: 'GET',
      url: `/api/v1/participantes/${fakeUuid}`
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('Participante not found')
  })
})
