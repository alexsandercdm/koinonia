import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { buildApp } from '../app'
import { db, schema } from '../db'
import { clearDatabase } from './helpers/setupTestDB'

describe('Acomodações - Operações E2E', () => {
  let app: FastifyInstance
  let adminToken: string
  let liderToken: string
  let servoToken: string
  let localId: string
  let quartoMasculinoId: string
  let quartoFemininoId: string
  let camaDisponivelId: string
  let camaBloqueadaId: string
  let camaFemininaId: string
  let eventoId: string
  let inscricaoMasculinaId: string
  let inscricaoMasculina2Id: string
  let inscricaoFemininaId: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3009 })
    } catch {
      // noop
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function createUser(email: string, role: string) {
    await fetch('http://localhost:3009/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: `Test ${role}` }),
    })

    await db.update(schema.user).set({ role: role as any }).where(eq(schema.user.email, email))

    const signInResponse = await fetch('http://localhost:3009/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    })

    const body = await signInResponse.json() as any
    return body.token as string
  }

  async function createParticipante(nome: string, genero: 'M' | 'F') {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { nome, genero },
    })

    return response.json().id as string
  }

  beforeEach(async () => {
    await clearDatabase()
    adminToken = await createUser('operacoes-admin@test.com', 'admin')
    liderToken = await createUser('operacoes-lider@test.com', 'lider')
    servoToken = await createUser('operacoes-servo@test.com', 'servo')

    const localResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/acomodacoes/locais',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Centro Operacional',
        endereco: 'Rua do Encontro, 42',
        capacidade_total: 120,
      },
    })
    localId = localResponse.json().id

    const quartoMasculinoResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/locais/${localId}/quartos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        nome: 'Quarto Masculino',
        genero_permitido: 'M',
        capacidade: 3,
      },
    })
    quartoMasculinoId = quartoMasculinoResponse.json().id

    const quartoFemininoResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/locais/${localId}/quartos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        nome: 'Quarto Feminino',
        genero_permitido: 'F',
        capacidade: 2,
      },
    })
    quartoFemininoId = quartoFemininoResponse.json().id

    const camaDisponivelResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/quartos/${quartoMasculinoId}/camas`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        identificacao: 'M1',
        tipo: 'solteiro',
      },
    })
    camaDisponivelId = camaDisponivelResponse.json().id

    const camaBloqueadaResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/quartos/${quartoMasculinoId}/camas`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        identificacao: 'M2',
        tipo: 'solteiro',
        bloqueada: true,
      },
    })
    camaBloqueadaId = camaBloqueadaResponse.json().id

    const camaFemininaResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/quartos/${quartoFemininoId}/camas`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        identificacao: 'F1',
        tipo: 'solteiro',
      },
    })
    camaFemininaId = camaFemininaResponse.json().id

    const eventoResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/eventos',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Retiro Operacional',
        data_inicio: new Date('2026-06-01T00:00:00.000Z').toISOString(),
        data_fim: new Date('2026-06-03T00:00:00.000Z').toISOString(),
        capacidade_maxima: 50,
        local_id: localId,
        configuracoes: [
          { papel: 'encontrista', valor: 150 },
          { papel: 'servo', valor: 50 },
        ],
      },
    })
    eventoId = eventoResponse.json().id

    const pessoaMasculinaId = await createParticipante('João Operador', 'M')
    const pessoaMasculina2Id = await createParticipante('Pedro Reserva', 'M')
    const pessoaFemininaId = await createParticipante('Maria Operadora', 'F')

    const inscricaoMasculinaResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoaMasculinaId,
        papel: 'encontrista',
      },
    })
    inscricaoMasculinaId = inscricaoMasculinaResponse.json().id

    const inscricaoMasculina2Response = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoaMasculina2Id,
        papel: 'servo',
      },
    })
    inscricaoMasculina2Id = inscricaoMasculina2Response.json().id

    const inscricaoFemininaResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoaFemininaId,
        papel: 'encontrista',
      },
    })
    inscricaoFemininaId = inscricaoFemininaResponse.json().id
  })

  it('deve retornar mapa por evento e inscritos disponíveis sem cama', async () => {
    const mapaAntes = await app.inject({
      method: 'GET',
      url: `/api/v1/eventos/${eventoId}/mapa-acomodacao`,
      headers: { authorization: `Bearer ${servoToken}` },
    })

    expect(mapaAntes.statusCode).toBe(200)
    expect(mapaAntes.json()).toMatchObject({
      evento: { id: eventoId, local_id: localId },
      local: { id: localId, nome: 'Centro Operacional' },
    })

    const quartos = mapaAntes.json().quartos as Array<any>
    const quartoMasculino = quartos.find((quarto) => quarto.id === quartoMasculinoId)
    expect(quartoMasculino.camas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: camaDisponivelId, status: 'disponivel' }),
        expect.objectContaining({ id: camaBloqueadaId, status: 'bloqueado' }),
      ]),
    )

    const inscricoesDisponiveis = await app.inject({
      method: 'GET',
      url: `/api/v1/eventos/${eventoId}/inscricoes-sem-cama?q=João`,
      headers: { authorization: `Bearer ${servoToken}` },
    })

    expect(inscricoesDisponiveis.statusCode).toBe(200)
    expect(inscricoesDisponiveis.json()).toEqual([
      expect.objectContaining({
        id: inscricaoMasculinaId,
        nome: 'João Operador',
      }),
    ])
  })

  it('deve atribuir cama, bloquear incompatibilidade de gênero e liberar sem mexer no financeiro', async () => {
    const assignResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/camas/${camaDisponivelId}/atribuir`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        inscricao_id: inscricaoMasculinaId,
      },
    })

    expect(assignResponse.statusCode).toBe(200)

    const mapaDepois = await app.inject({
      method: 'GET',
      url: `/api/v1/eventos/${eventoId}/mapa-acomodacao`,
      headers: { authorization: `Bearer ${servoToken}` },
    })

    const quartoMasculino = (mapaDepois.json().quartos as Array<any>).find((quarto) => quarto.id === quartoMasculinoId)
    expect(quartoMasculino.camas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: camaDisponivelId,
          status: 'ocupado',
          ocupante: expect.objectContaining({
            inscricao_id: inscricaoMasculinaId,
            nome: 'João Operador',
          }),
        }),
      ]),
    )

    const generoInvalido = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/camas/${camaFemininaId}/atribuir`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        inscricao_id: inscricaoMasculina2Id,
      },
    })

    expect(generoInvalido.statusCode).toBe(422)

    const camaOcupada = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/camas/${camaDisponivelId}/atribuir`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        inscricao_id: inscricaoMasculina2Id,
      },
    })

    expect(camaOcupada.statusCode).toBe(409)

    const camaBloqueada = await app.inject({
      method: 'POST',
      url: `/api/v1/acomodacoes/camas/${camaBloqueadaId}/atribuir`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        inscricao_id: inscricaoMasculina2Id,
      },
    })

    expect(camaBloqueada.statusCode).toBe(409)

    const pagamentoResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/inscricoes/${inscricaoMasculinaId}/pagamentos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { valor: 25, forma_pagamento: 'pix' },
    })
    expect(pagamentoResponse.statusCode).toBe(201)

    const releaseResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/acomodacoes/camas/${camaDisponivelId}/atribuir`,
      headers: { authorization: `Bearer ${liderToken}` },
    })

    expect(releaseResponse.statusCode).toBe(200)
    expect(releaseResponse.json().cama_id).toBeNull()

    const inscricaoAposLiberacao = await app.inject({
      method: 'GET',
      url: `/api/v1/inscricoes/${inscricaoMasculinaId}`,
      headers: { authorization: `Bearer ${liderToken}` },
    })

    expect(inscricaoAposLiberacao.json().status).toBe('PAGO_PARCIAL')
    expect(inscricaoAposLiberacao.json().cama_id).toBeNull()
    expect(inscricaoAposLiberacao.json().pagamentos).toHaveLength(1)
  })

  it('deve permitir apenas uma atribuição concorrente para a mesma cama', async () => {
    const results = await Promise.allSettled([
      app.inject({
        method: 'POST',
        url: `/api/v1/acomodacoes/camas/${camaDisponivelId}/atribuir`,
        headers: { authorization: `Bearer ${liderToken}` },
        payload: {
          inscricao_id: inscricaoMasculinaId,
        },
      }),
      app.inject({
        method: 'POST',
        url: `/api/v1/acomodacoes/camas/${camaDisponivelId}/atribuir`,
        headers: { authorization: `Bearer ${liderToken}` },
        payload: {
          inscricao_id: inscricaoMasculina2Id,
        },
      }),
    ])

    const fulfilled = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map((result) => result.value.statusCode)

    expect(fulfilled.filter((statusCode) => statusCode === 200)).toHaveLength(1)
    expect(fulfilled.filter((statusCode) => statusCode === 409)).toHaveLength(1)

    const inscricoes = await Promise.all([
      app.inject({
        method: 'GET',
        url: `/api/v1/inscricoes/${inscricaoMasculinaId}`,
        headers: { authorization: `Bearer ${liderToken}` },
      }),
      app.inject({
        method: 'GET',
        url: `/api/v1/inscricoes/${inscricaoMasculina2Id}`,
        headers: { authorization: `Bearer ${liderToken}` },
      }),
    ])

    const ocupantes = inscricoes.filter((response) => response.json().cama_id === camaDisponivelId)
    expect(ocupantes).toHaveLength(1)
  })
})
