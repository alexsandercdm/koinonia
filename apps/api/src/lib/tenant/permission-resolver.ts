import { Operation, OrgRole, type ResourceScope } from './types'

const ADMIN_ROLES: OrgRole[] = [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL]
const SELF_ENROLL_ROLES: OrgRole[] = Object.values(OrgRole)

const PERMISSIONS: Record<Operation, OrgRole[]> = {
  [Operation.CREATE_EVENTO]: ADMIN_ROLES,
  [Operation.EDIT_EVENTO]: ADMIN_ROLES,
  [Operation.TRANSITION_EVENTO]: ADMIN_ROLES,
  [Operation.CANCEL_EVENTO]: ADMIN_ROLES,
  [Operation.INVITE_MEMBER]: ADMIN_ROLES,
  [Operation.UPDATE_MEMBER_ROLE]: ADMIN_ROLES,
  [Operation.TRANSFER_PRESIDENCY]: [OrgRole.PRESIDENTE],
  [Operation.CREATE_PESSOA]: [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE],
  [Operation.EDIT_PESSOA]: [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR],
  [Operation.ENROLL_OTHER]: [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL, OrgRole.PASTOR_REDE, OrgRole.DISCIPULADOR],
  [Operation.SELF_ENROLL]: SELF_ENROLL_ROLES,
  [Operation.VIEW_ORG_SETTINGS]: ADMIN_ROLES,
}

const PESSOAS_SCOPE: Record<OrgRole, ResourceScope> = {
  [OrgRole.PRESIDENTE]: 'ALL_ORG',
  [OrgRole.PASTOR_PRINCIPAL]: 'ALL_ORG',
  [OrgRole.PASTOR_REDE]: 'OWN_SUBTREE',
  [OrgRole.DISCIPULADOR]: 'OWN_SUBTREE',
  [OrgRole.LIDER_CELULA]: 'DIRECT_CHILDREN',
  [OrgRole.MEMBRO]: 'SELF_ONLY',
}

export function canPerform(role: OrgRole, operation: Operation): boolean {
  return PERMISSIONS[operation]?.includes(role) ?? false
}

export function canViewPessoas(role: OrgRole): ResourceScope {
  return PESSOAS_SCOPE[role]
}

export function canViewEvento(role: OrgRole, status: string): boolean {
  if (status === 'planejamento') {
    return ADMIN_ROLES.includes(role)
  }

  return true
}
