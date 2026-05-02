export const OrgRole = {
  PRESIDENTE: 'PRESIDENTE',
  PASTOR_PRINCIPAL: 'PASTOR_PRINCIPAL',
  PASTOR_REDE: 'PASTOR_REDE',
  DISCIPULADOR: 'DISCIPULADOR',
  LIDER_CELULA: 'LIDER_CELULA',
  MEMBRO: 'MEMBRO',
} as const

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole]

export const Operation = {
  CREATE_EVENTO: 'CREATE_EVENTO',
  EDIT_EVENTO: 'EDIT_EVENTO',
  TRANSITION_EVENTO: 'TRANSITION_EVENTO',
  CANCEL_EVENTO: 'CANCEL_EVENTO',
  INVITE_MEMBER: 'INVITE_MEMBER',
  UPDATE_MEMBER_ROLE: 'UPDATE_MEMBER_ROLE',
  TRANSFER_PRESIDENCY: 'TRANSFER_PRESIDENCY',
  CREATE_PESSOA: 'CREATE_PESSOA',
  EDIT_PESSOA: 'EDIT_PESSOA',
  ENROLL_OTHER: 'ENROLL_OTHER',
  SELF_ENROLL: 'SELF_ENROLL',
  VIEW_ORG_SETTINGS: 'VIEW_ORG_SETTINGS',
} as const

export type Operation = (typeof Operation)[keyof typeof Operation]

export type ResourceScope = 'ALL_ORG' | 'OWN_SUBTREE' | 'DIRECT_CHILDREN' | 'SELF_ONLY'

export interface TenantContext {
  orgId: string
  userId: string
  userRole: OrgRole
}
