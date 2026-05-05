import { describe, it, expect } from 'vitest'
import { canPerform, canViewPessoas, canViewEvento } from '../lib/tenant/permission-resolver'
import { OrgRole, Operation } from '../lib/tenant/types'

describe('RBAC matrix', () => {
  const eventOps = [Operation.CREATE_EVENTO, Operation.EDIT_EVENTO, Operation.TRANSITION_EVENTO, Operation.CANCEL_EVENTO]
  const admins = [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL]
  const nonAdmins = [OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR, OrgRole.LIDER_CELULA, OrgRole.MEMBRO]

  it('only admins can manage eventos', () => {
    for (const op of eventOps) {
      for (const role of admins) expect(canPerform(role, op), `${role} / ${op}`).toBe(true)
      for (const role of nonAdmins) expect(canPerform(role, op), `${role} / ${op}`).toBe(false)
    }
  })

  it('only PRESIDENTE can transfer presidency', () => {
    expect(canPerform(OrgRole.PRESIDENTE, Operation.TRANSFER_PRESIDENCY)).toBe(true)
    for (const role of nonAdmins) expect(canPerform(role, Operation.TRANSFER_PRESIDENCY)).toBe(false)
    expect(canPerform(OrgRole.PASTOR_PRINCIPAL, Operation.TRANSFER_PRESIDENCY)).toBe(false)
  })

  it('all roles can self-enroll', () => {
    for (const role of Object.values(OrgRole)) {
      expect(canPerform(role as OrgRole, Operation.SELF_ENROLL)).toBe(true)
    }
  })

  it('pessoas visibility scope per role', () => {
    expect(canViewPessoas(OrgRole.PRESIDENTE)).toBe('ALL_ORG')
    expect(canViewPessoas(OrgRole.PASTOR_PRINCIPAL)).toBe('ALL_ORG')
    expect(canViewPessoas(OrgRole.PASTOR_REDE)).toBe('OWN_SUBTREE')
    expect(canViewPessoas(OrgRole.DISCIPULADOR)).toBe('OWN_SUBTREE')
    expect(canViewPessoas(OrgRole.LIDER_CELULA)).toBe('DIRECT_CHILDREN')
    expect(canViewPessoas(OrgRole.MEMBRO)).toBe('SELF_ONLY')
  })

  it('planejamento visible only to admins', () => {
    for (const role of admins) expect(canViewEvento(role, 'planejamento')).toBe(true)
    for (const role of nonAdmins) expect(canViewEvento(role, 'planejamento')).toBe(false)
  })

  it('all public statuses visible to all roles', () => {
    for (const status of ['inscricoes_abertas', 'em_andamento', 'finalizado', 'cancelado']) {
      for (const role of Object.values(OrgRole)) {
        expect(canViewEvento(role as OrgRole, status)).toBe(true)
      }
    }
  })
})
