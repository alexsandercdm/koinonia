import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../app'
import { clearDatabase } from './helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { db, schema } from '../db'
import { eq } from 'drizzle-orm'

describe('Inscrições & Eventos E2E', () => {
  let app: FastifyInstance
  let adminToken: string
  let liderToken: string
  let eventoId: string
  let pessoa1Id: string
  let pessoa2Id: string
  let pessoa3Id: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3007 })
    } catch {
      // Already listening
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function createUser(email: string, role: string) {
    await fetch('http://localhost:3007/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: `Test ${role}` })
    })
    await db.update(schema.user).set({ role: role as any }).where(eq(schema.user.email, email))
    
    const signInResponse = await fetch('http://localhost:3007/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    })
    const body = await signInResponse.json() as any
    return body.token
  }

  beforeEach(async () => {
    await clearDatabase()
    adminToken = await createUser('admin@test.com', 'admin')
    liderToken = await createUser('lider@test.com', 'lider')

    // Create 2 people
    const p1 = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { nome: 'Pessoa 1', genero: 'M' }
    })
    pessoa1Id = p1.json().id

    const p2 = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { nome: 'Pessoa 2', genero: 'F' }
    })
    pessoa2Id = p2.json().id

    const p3 = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { nome: 'Pessoa 3', genero: 'M' }
    })
    pessoa3Id = p3.json().id
  })

  it('deve realizar o ciclo completo de evento e inscrição', async () => {
    // 1. Create Event with capacity 1
    const eventoResp = await app.inject({
      method: 'POST',
      url: '/api/v1/eventos',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Retiro Teste',
        data_inicio: new Date().toISOString(),
        data_fim: new Date().toISOString(),
        capacidade_maxima: 1,
        configuracoes: [
          { papel: 'encontrista', valor: 150 },
          { papel: 'servo', valor: 80 }
        ]
      }
    })
    expect(eventoResp.statusCode).toBe(201)
    eventoId = eventoResp.json().id

    // 2. Register 1st person (Should be PENDENTE)
    const insc1Resp = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoa1Id,
        papel: 'encontrista'
      }
    })
    expect(insc1Resp.statusCode).toBe(201)
    expect(insc1Resp.json().status).toBe('PENDENTE')
    const insc1Id = insc1Resp.json().id

    // 3. Register 2nd person (Should be LISTA_ESPERA since capacity is 1)
    const insc2Resp = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoa2Id,
        papel: 'servo'
      }
    })
    expect(insc2Resp.json().status).toBe('LISTA_ESPERA')
    const insc2Id = insc2Resp.json().id

    // 4. Add partial payment to 1st person
    const pay1Resp = await app.inject({
      method: 'POST',
      url: `/api/v1/inscricoes/${insc1Id}/pagamentos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { valor: 50, forma_pagamento: 'PIX' }
    })
    expect(pay1Resp.statusCode).toBe(201)
    
    const insc1AfterPay = await app.inject({
      method: 'GET',
      url: `/api/v1/inscricoes/${insc1Id}`,
      headers: { authorization: `Bearer ${liderToken}` }
    })
    expect(insc1AfterPay.json().status).toBe('PAGO_PARCIAL')

    // 5. Add full payment to 1st person
    await app.inject({
      method: 'POST',
      url: `/api/v1/inscricoes/${insc1Id}/pagamentos`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { valor: 100, forma_pagamento: 'Dinheiro' }
    })
    
    const insc1Full = await app.inject({
      method: 'GET',
      url: `/api/v1/inscricoes/${insc1Id}`,
      headers: { authorization: `Bearer ${liderToken}` }
    })
    expect(insc1Full.json().status).toBe('PAGO_TOTAL')

    // 6. Replace Participant using a person who is not already registered in the event
    const replaceResp = await app.inject({
      method: 'POST',
      url: `/api/v1/inscricoes/${insc1Id}/substituir`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { new_pessoa_id: pessoa3Id }
    })
    expect(replaceResp.statusCode).toBe(200)
    expect(replaceResp.json().pessoa_id).toBe(pessoa3Id)

    // 7. Cancel and Refund
    const cancelResp = await app.inject({
      method: 'POST',
      url: `/api/v1/inscricoes/${insc1Id}/cancelar`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { refund_amount: 50, forma_estorno: 'PIX' }
    })
    expect(cancelResp.json().status).toBe('CANCELADA')
    
    // Check inadimplentes
    const inadResp = await app.inject({
      method: 'GET',
      url: `/api/v1/eventos/${eventoId}/inadimplentes`,
      headers: { authorization: `Bearer ${liderToken}` }
    })
    // Since we canceled insc1 and insc2 is LISTA_ESPERA, there should be none listed as PENDENTE/PARCIAL?
    // Wait, LISTA_ESPERA is not typically listed as inadimplente until promoted.
    expect(inadResp.json().length).toBe(0)
  })

  it('deve permitir atualizar evento e substituir configuracoes de preco', async () => {
    const eventoResp = await app.inject({
      method: 'POST',
      url: '/api/v1/eventos',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Retiro Atualizar',
        data_inicio: new Date('2026-05-01T00:00:00.000Z').toISOString(),
        data_fim: new Date('2026-05-03T00:00:00.000Z').toISOString(),
        capacidade_maxima: 50,
        configuracoes: [
          { papel: 'encontrista', valor: 150 },
        ]
      }
    })

    const eventoId = eventoResp.json().id

    const updateResp = await app.inject({
      method: 'PUT',
      url: `/api/v1/eventos/${eventoId}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Retiro Atualizado',
        capacidade_maxima: 60,
        status: 'aberto',
        configuracoes: [
          { papel: 'encontrista', valor: 180 },
          { papel: 'servo', valor: 90 },
        ]
      }
    })

    expect(updateResp.statusCode).toBe(200)
    expect(updateResp.json().nome).toBe('Retiro Atualizado')
    expect(updateResp.json().capacidade_maxima).toBe(60)
    expect(updateResp.json().status).toBe('aberto')
    expect(updateResp.json().configuracoes).toHaveLength(2)
  })

  it('deve bloquear inscricao duplicada para a mesma pessoa no evento', async () => {
    const eventoResp = await app.inject({
      method: 'POST',
      url: '/api/v1/eventos',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        nome: 'Retiro Duplicado',
        data_inicio: new Date().toISOString(),
        data_fim: new Date().toISOString(),
        capacidade_maxima: 10,
        configuracoes: [
          { papel: 'encontrista', valor: 150 },
        ]
      }
    })

    const eventoId = eventoResp.json().id

    const firstResp = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoa1Id,
        papel: 'encontrista'
      }
    })

    expect(firstResp.statusCode).toBe(201)

    const duplicateResp = await app.inject({
      method: 'POST',
      url: '/api/v1/inscricoes',
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        evento_id: eventoId,
        pessoa_id: pessoa1Id,
        papel: 'encontrista'
      }
    })

    expect(duplicateResp.statusCode).toBe(400)
    expect(duplicateResp.json().error).toContain('já possui inscrição')
  })
})
