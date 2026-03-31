import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../app'
import { clearDatabase } from './helpers/setupTestDB'
import { FastifyInstance } from 'fastify'
import { db, schema } from '../db'
import { eq } from 'drizzle-orm'

describe('Unified Pessoas E2E (PES-01 to PES-05)', () => {
  let app: FastifyInstance
  let adminToken: string
  let createdPessoaId: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3007 })
    } catch {
      // Ignore if already listening
    }
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await clearDatabase()

    // Setup Auth
    const email = 'admin_e2e@example.com'
    await fetch('http://localhost:3007/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: 'Admin E2E' })
    })

    await db.update(schema.user).set({ role: 'admin' }).where(eq(schema.user.email, email))

    const res = await fetch('http://localhost:3007/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    })
    const body = await res.json() as any
    adminToken = body.token
  })

  it('PES-01: Deve criar participante com contato de emergência', async () => {
    const payload = {
      nome: 'Carlos Eduardo',
      genero: 'M',
      email: 'carlos@test.com',
      telefone: '11988887777',
      contato_emergencia_nome: 'Maria Silva',
      contato_emergencia_tel: '11977776666'
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${adminToken}` },
      payload
    })

    expect(response.statusCode).toBe(201)
    const data = response.json()
    expect(data.id).toBeDefined()
    expect(data.nome).toBe(payload.nome)
    expect(data.contato_emergencia_nome).toBe(payload.contato_emergencia_nome)
    
    createdPessoaId = data.id // Save for next tests, though isolated, we test in sequence? No, beforeEach clears! 
  })

  it('PES-02: Deve pesquisar e listar participantes', async () => {
    // 1. Arrange: Create two participants
    await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { nome: 'Alice', genero: 'F', email: 'alice@test.com' }
    })
    await app.inject({
        method: 'POST',
        url: '/api/v1/participantes',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { nome: 'Bob Carlos', genero: 'M', email: 'bob@test.com' }
    })

    // 2. Act: Search for "Alice"
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/participantes?q=Alice',
      headers: { authorization: `Bearer ${adminToken}` }
    })

    expect(response.statusCode).toBe(200)
    const list = response.json().data
    expect(list.length).toBe(1)
    expect(list[0].nome).toBe('Alice')
  })

  it('PES-03: Deve trazer historico do participante vazio inicialmente', async () => {
    // 1. Arrange
    const createResp = await app.inject({
        method: 'POST',
        url: '/api/v1/participantes',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { nome: 'Historico Test', genero: 'M', email: 'hist@test.com' }
    })
    const id = createResp.json().id

    // 2. Act
    const response = await app.inject({
        method: 'GET',
        url: `/api/v1/participantes/${id}/historico`,
        headers: { authorization: `Bearer ${adminToken}` }
    })

    // 3. Assert
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([]) // Arrays inside since no inscricoes exist
  })

  it('PES-05: Exclusão lógica (Soft-delete) reflete na listagem', async () => {
    // 1. Arrange: Create one
    const createResp = await app.inject({
        method: 'POST',
        url: '/api/v1/participantes',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { nome: 'To Be Deleted', genero: 'M', email: 'delete@test.com' }
    })
    const id = createResp.json().id

    // Check list
    let listResp = await app.inject({
        method: 'GET',
        url: '/api/v1/participantes',
        headers: { authorization: `Bearer ${adminToken}` }
    })
    expect(listResp.json().data.length).toBe(1)

    // 2. Act: Delete
    const deleteResp = await app.inject({
        method: 'DELETE',
        url: `/api/v1/participantes/${id}`,
        headers: { authorization: `Bearer ${adminToken}` }
    })
    expect(deleteResp.statusCode).toBe(204)

    // 3. Assert: Must not be listed
    listResp = await app.inject({
        method: 'GET',
        url: '/api/v1/participantes',
        headers: { authorization: `Bearer ${adminToken}` }
    })
    expect(listResp.json().data.length).toBe(0)
  })
})
