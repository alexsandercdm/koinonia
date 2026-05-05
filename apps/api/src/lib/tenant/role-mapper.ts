import type { OrgRole } from './types'

export function mapOrgRoleToAuthRole(orgRole: OrgRole): 'admin' | 'member' {
  return orgRole === 'PRESIDENTE' || orgRole === 'PASTOR_PRINCIPAL' ? 'admin' : 'member'
}

export function canCreateEvents(orgRole: OrgRole): boolean {
  return orgRole === 'PRESIDENTE' || orgRole === 'PASTOR_PRINCIPAL'
}

export function canManageOrganization(orgRole: OrgRole): boolean {
  return orgRole === 'PRESIDENTE'
}

export function canManageMembers(orgRole: OrgRole): boolean {
  return orgRole === 'PRESIDENTE' || orgRole === 'PASTOR_PRINCIPAL'
}
