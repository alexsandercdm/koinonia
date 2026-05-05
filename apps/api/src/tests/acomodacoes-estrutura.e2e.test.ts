import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { buildApp } from '../app'
import { db, schema } from '../db'
import { clearDatabase } from './helpers/setupTestDB'
import { signInWithActiveOrg } from './helpers/authWithOrg'

describe('Acomodações - Estrutura E2E', () => {
  let app: FastifyInstance
  let adminToken: string
  let liderToken: string
  let servoToken: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3008 })
    } catch {
      // noop
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function createUser(email: string, role: string) {
    return signInWithActiveOrg({
      baseUrl: 'http://localhost:3008',
      email,
      name: `Test ${role}`,
      role: role as 'admin' | 'lider' | 'servo',
    })
  }

  beforeEach(async () => {
    await clearDatabase()
    adminToken = await createUser('acomodacoes-admin@test.com', 'admin')
    liderToken = await createUser('acomodacoes-lider@test.com', 'lider')
    servoToken = await createUser('acomodacoes-servo@test.com', 'servo')
  })

  it('deve criar e listar a estrutura hierárquica de local, quarto e cama', async () => {
    const localResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/acomodacoes/locais',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Casa de Retiro Central',
        endereco: 'Rua das Oliveiras, 100',
        capacidade_total: 80,
      },
    })

    expect(localResponse.statusCode).toBe(201)
    const localId = localResponse.json().id as string

    const quartoResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/locais/${localId}/quartos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        nome: 'Quarto Azul',
        genero_permitido: 'M',
        capacidade: 4,
      },
    })

    expect(quartoResponse.statusCode).toBe(201)
    const quartoId = quartoResponse.json().id as string

    const camaResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/quartos/${quartoId}/camas`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        identificacao: 'A1',
        tipo: 'solteiro',
      },
    })

    expect(camaResponse.statusCode).toBe(201)
    expect(camaResponse.json().bloqueada).toBe(false)

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/acomodacoes/locais',
      headers: { authorization: `Bearer ${servoToken}` },
    })

    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json()).toMatchObject([
      {
        id: localId,
        nome: 'Casa de Retiro Central',
        quartos: [
          {
            id: quartoId,
            nome: 'Quarto Azul',
            genero_permitido: 'M',
            camas: [
              {
                identificacao: 'A1',
                tipo: 'solteiro',
                bloqueada: false,
              },
            ],
          },
        ],
      },
    ])
  })

  it('deve impedir que servo altere a estrutura de acomodações', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/acomodacoes/locais',
      headers: { authorization: `Bearer ${servoToken}` },
      payload: {
        nome: 'Local Restrito',
      },
    })

    expect(response.statusCode).toBe(403)
  })
})
