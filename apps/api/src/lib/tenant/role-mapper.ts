import type { OrgRole } from './types'

const ADMIN_ROLES: OrgRole[] = ['PRESIDENTE', 'PASTOR_PRINCIPAL']

/**
 * Maps a Koinonia organization role to a generic auth role.
 * PRESIDENTE and PASTOR_PRINCIPAL → 'admin', all others → 'member'
 */
export function mapOrgRoleToAuthRole(orgRole: OrgRole): 'admin' | 'member' {
  return ADMIN_ROLES.includes(orgRole) ? 'admin' : 'member'
}

/**
 * Checks if a role can create events.
 * Only PRESIDENTE and PASTOR_PRINCIPAL have this permission.
 */
export function canCreateEvents(orgRole: OrgRole): boolean {
  return ADMIN_ROLES.includes(orgRole)
}

/**
 * Checks if a role can manage the organization.
 * Only PRESIDENTE has this permission.
 */
export function canManageOrganization(orgRole: OrgRole): boolean {
  return orgRole === 'PRESIDENTE'
}

/**
 * Checks if a role can manage organization members.
 * PRESIDENTE and PASTOR_PRINCIPAL have this permission.
 */
export function canManageMembers(orgRole: OrgRole): boolean {
  return ADMIN_ROLES.includes(orgRole)
}
