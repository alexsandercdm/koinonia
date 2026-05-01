import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { buildApp } from '../../../app'
import { db, schema } from '../../../db'
import { clearDatabase } from '../../../tests/helpers/setupTestDB'

describe('UpdateParticipanteUseCase (Integração E2E)', () => {
  let app: FastifyInstance
  let liderToken: string
  let adminToken: string
  let servoToken: string

  beforeAll(async () => {
    app = buildApp()
    try {
      await app.listen({ port: 3010 })
    } catch {
      // noop
    }
  })

  afterAll(async () => {
    await app.close()
  })

  async function createUser(role: 'admin' | 'lider' | 'servo') {
    const email = `${role}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`

    await fetch('http://localhost:3010/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!', name: `Test ${role}` }),
    })

    await db.update(schema.user).set({ role }).where(eq(schema.user.email, email))

    const signInResponse = await fetch('http://localhost:3010/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    })

    const body = await signInResponse.json() as any
    return body.token as string
  }

  async function createParticipante(token: string, payload: Record<string, unknown>) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/participantes',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        nome: 'Participante Teste',
        genero: 'F',
        ...payload,
      },
    })

    expect(response.statusCode).toBe(201)
    return response.json()
  }

  beforeEach(async () => {
    await clearDatabase()
    liderToken = await createUser('lider')
    adminToken = await createUser('admin')
    servoToken = await createUser('servo')
  })

  it('deve atualizar participante completo e registrar UPDATE_PARTICIPANT no audit log', async () => {
    const participante = await createParticipante(liderToken, {
      nome: 'Fernanda',
      email: 'fernanda.original@example.com',
      telefone: '11911112222',
    })

    const patchResp = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${participante.id}`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: {
        nome: 'Fernanda Atualizada',
        telefone: '11999998888',
        alergias: 'Camarão',
        contato_emergencia_nome: 'Maria',
        contato_emergencia_tel: '11888887777',
      },
    })

    expect(patchResp.statusCode).toBe(200)
    expect(patchResp.json()).toMatchObject({
      nome: 'Fernanda Atualizada',
      telefone: '11999998888',
      alergias: 'Camarão',
      contato_emergencia_nome: 'Maria',
      contato_emergencia_tel: '11888887777',
    })

    const getResp = await app.inject({
      method: 'GET',
      url: `/api/v1/participantes/${participante.id}`,
      headers: { authorization: `Bearer ${liderToken}` },
    })

    expect(getResp.statusCode).toBe(200)
    expect(getResp.json()).toMatchObject({
      nome: 'Fernanda Atualizada',
      telefone: '11999998888',
      alergias: 'Camarão',
      contato_emergencia_nome: 'Maria',
      contato_emergencia_tel: '11888887777',
    })

    const logs = await db.select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.target_id, participante.id))

    expect(logs).toHaveLength(1)
    expect(logs[0].action).toBe('UPDATE_PARTICIPANT')
  })

  it('deve bloquear email ou telefone duplicado', async () => {
    const participanteA = await createParticipante(liderToken, {
      nome: 'Participante A',
      email: 'duplicado@example.com',
      telefone: '11911110000',
    })
    const participanteB = await createParticipante(liderToken, {
      nome: 'Participante B',
      email: 'segundo@example.com',
      telefone: '11922220000',
    })

    expect(participanteA.id).toBeTruthy()

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${participanteB.id}`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { email: 'duplicado@example.com' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Email already exists')
  })

  it('deve negar PATCH para role servo', async () => {
    const participante = await createParticipante(liderToken, {
      email: 'servo-target@example.com',
    })

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${participante.id}`,
      headers: { authorization: `Bearer ${servoToken}` },
      payload: { nome: 'Tentativa Servo' },
    })

    expect(response.statusCode).toBe(403)
  })

  it('nao deve atualizar participante com soft-delete', async () => {
    const participante = await createParticipante(liderToken, {
      email: 'deleted-target@example.com',
    })

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/participantes/${participante.id}`,
      headers: { authorization: `Bearer ${adminToken}` },
    })

    expect(deleteResponse.statusCode).toBe(204)

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/v1/participantes/${participante.id}`,
      headers: { authorization: `Bearer ${liderToken}` },
      payload: { nome: 'Nao Pode Atualizar' },
    })

    expect(response.statusCode).toBe(404)
  })
})
