import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'

describe('ListParticipantesUseCase (Integração E2E)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await clearDatabase()

    // Insere massa de dados inicial
    await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Alice Alves', genero: 'F', email: 'alice@test.com' }
    })
    await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      payload: { nome: 'Bob Batista', genero: 'M', email: 'bob@test.com' }
    })
  })

  it('deve listar todos os participantes com paginação padrão', async () => {
    const response = await app.inject({
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
