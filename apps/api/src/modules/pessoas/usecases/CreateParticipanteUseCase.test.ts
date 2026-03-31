import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../../app'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { db } from '../../../db'
import { pessoas } from '../../../db/schema'

describe('CreateParticipanteUseCase (Integração E2E)', () => {
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
  })

  it('deve criar um participante com sucesso', async () => {
    const response = await app.inject({
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
