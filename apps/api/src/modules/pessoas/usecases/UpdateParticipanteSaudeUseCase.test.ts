import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('UpdateParticipanteSaudeUseCase (Integração E2E)', () => {
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
      payload: { 
        nome: 'Fernanda', 
        genero: 'F', 
        email: 'fenanda@test.com',
        alergias: 'Camarão'
      }
    })
    
    createdId = response.json().id
  })

  it('deve atualizar os dados de saúde do participante via PATCH', async () => {
    const patchResp = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${createdId}/saude`,
      payload: {
        medicamentos: 'Dipirona',
        restricoes_alimentares: ['Lactose', 'Glúten']
      }
    })

    expect(patchResp.statusCode).toBe(200)

    const updatedParticipante = patchResp.json()
    expect(updatedParticipante.medicamentos).toBe('Dipirona')
    // A alergia anterior deve ter sido mantida caso a entidade inteira seja parseada
    // Porem o UPDATE só atinge o que enviamos, então camarão se mantém
    // Note: Drizzle update com set({ ...data }) so atualiza o Object.keys() passados.
    
    // Validate with GET
    const getResp = await app.inject({
      method: 'GET',
      url: `/api/v1/participantes/${createdId}`
    })
    expect(getResp.json().alergias).toBe('Camarão')
    expect(getResp.json().medicamentos).toBe('Dipirona')
    expect(getResp.json().restricoes_alimentares).toEqual(['Lactose', 'Glúten'])
  })
})
