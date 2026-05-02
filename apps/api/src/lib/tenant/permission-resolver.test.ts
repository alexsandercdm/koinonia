import { describe, expect, it } from 'vitest'
import { canPerform, canViewEvento, canViewPessoas } from './permission-resolver'
import { Operation, OrgRole } from './types'

describe('canPerform', () => {
  it('PRESIDENTE can create evento', () => {
    expect(canPerform(OrgRole.PRESIDENTE, Operation.CREATE_EVENTO)).toBe(true)
  })

  it('MEMBRO cannot create evento', () => {
    expect(canPerform(OrgRole.MEMBRO, Operation.CREATE_EVENTO)).toBe(false)
  })

  it('only PRESIDENTE can transfer presidency', () => {
    expect(canPerform(OrgRole.PRESIDENTE, Operation.TRANSFER_PRESIDENCY)).toBe(true)
    expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.TRANSFER_PRESIDENCY)).toBe(false)
  })

  it('all roles can self-enroll', () => {
    for (const role of Object.values(OrgRole)) {
      expect(canPerform(role, Operation.SELF_ENROLL)).toBe(true)
    }
  })

  it('PASTOR_REDE can create pessoa, DISCIPULADOR cannot', () => {
    expect(canPerform(OrgRole.PASTOR_REDE, Operation.CREATE_PESSOA)).toBe(true)
    expect(canPerform(OrgRole.DISCIPULADOR, Operation.CREATE_PESSOA)).toBe(false)
  })
})

describe('canViewPessoas', () => {
  it('maps each role to the correct scope', () => {
    expect(canViewPessoas(OrgRole.PRESIDENTE)).toBe('ALL_ORG')
    expect(canViewPessoas(OrgRole.PASTOR_PRINCIPAL)).toBe('ALL_ORG')
    expect(canViewPessoas(OrgRole.PASTOR_REDE)).toBe('OWN_SUBTREE')
    expect(canViewPessoas(OrgRole.DISCIPULADOR)).toBe('OWN_SUBTREE')
    expect(canViewPessoas(OrgRole.LIDER_CELULA)).toBe('DIRECT_CHILDREN')
    expect(canViewPessoas(OrgRole.MEMBRO)).toBe('SELF_ONLY')
  })
})

describe('canViewEvento', () => {
  it('planejamento: visible only to PRESIDENTE and PASTOR_PRINCIPAL', () => {
    expect(canViewEvento(OrgRole.PRESIDENTE, 'planejamento')).toBe(true)
    expect(canViewEvento(OrgRole.PASTOR_PRINCIPAL, 'planejamento')).toBe(true)
    expect(canViewEvento(OrgRole.PASTOR_REDE, 'planejamento')).toBe(false)
    expect(canViewEvento(OrgRole.MEMBRO, 'planejamento')).toBe(false)
  })

  it('inscricoes_abertas: visible to all roles', () => {
    for (const role of Object.values(OrgRole)) {
      expect(canViewEvento(role, 'inscricoes_abertas')).toBe(true)
    }
  })
})
