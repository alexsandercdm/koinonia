import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('DeleteParticipanteUseCase (Integração E2E)', () => {
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
      payload: { nome: 'Daniel', genero: 'M', email: 'daniel@test.com' }
    })
    
    createdId = response.json().id
  })

  it('deve realizar soft delete de um participante, retornando 204', async () => {
    const deleteResp = await app.inject({
      method: 'DELETE',
      url: `/api/v1/participantes/${createdId}`
    })

    expect(deleteResp.statusCode).toBe(204)

    // Verifica que nao vem mais na listagem default (pois isNull(deleted_at))
    const listResp = await app.inject({
      method: 'GET',
      url: '/api/v1/participantes'
    })
    
    expect(listResp.json().data.length).toBe(0)
  })
})
