import { describe, it, expect } from 'vitest'
import type { OrgRole } from '../types'
import {
  mapOrgRoleToAuthRole,
  canCreateEvents,
  canManageOrganization,
  canManageMembers,
} from '../role-mapper'

describe('Role Mapper', () => {
  describe('mapOrgRoleToAuthRole', () => {
    it('maps PRESIDENTE to admin', () => {
      expect(mapOrgRoleToAuthRole('PRESIDENTE')).toBe('admin')
    })

    it('maps PASTOR_PRINCIPAL to admin', () => {
      expect(mapOrgRoleToAuthRole('PASTOR_PRINCIPAL')).toBe('admin')
    })

    it('maps PASTOR_REDE to member', () => {
      expect(mapOrgRoleToAuthRole('PASTOR_REDE')).toBe('member')
    })

    it('maps DISCIPULADOR to member', () => {
      expect(mapOrgRoleToAuthRole('DISCIPULADOR')).toBe('member')
    })

    it('maps LIDER_CELULA to member', () => {
      expect(mapOrgRoleToAuthRole('LIDER_CELULA')).toBe('member')
    })

    it('maps MEMBRO to member', () => {
      expect(mapOrgRoleToAuthRole('MEMBRO')).toBe('member')
    })
  })

  describe('canCreateEvents', () => {
    it('allows PRESIDENTE to create events', () => {
      expect(canCreateEvents('PRESIDENTE')).toBe(true)
    })

    it('allows PASTOR_PRINCIPAL to create events', () => {
      expect(canCreateEvents('PASTOR_PRINCIPAL')).toBe(true)
    })

    it('denies PASTOR_REDE from creating events', () => {
      expect(canCreateEvents('PASTOR_REDE')).toBe(false)
    })

    it('denies DISCIPULADOR from creating events', () => {
      expect(canCreateEvents('DISCIPULADOR')).toBe(false)
    })

    it('denies LIDER_CELULA from creating events', () => {
      expect(canCreateEvents('LIDER_CELULA')).toBe(false)
    })

    it('denies MEMBRO from creating events', () => {
      expect(canCreateEvents('MEMBRO')).toBe(false)
    })
  })

  describe('canManageOrganization', () => {
    it('allows PRESIDENTE to manage organization', () => {
      expect(canManageOrganization('PRESIDENTE')).toBe(true)
    })

    it('denies PASTOR_PRINCIPAL from managing organization', () => {
      expect(canManageOrganization('PASTOR_PRINCIPAL')).toBe(false)
    })

    it('denies PASTOR_REDE from managing organization', () => {
      expect(canManageOrganization('PASTOR_REDE')).toBe(false)
    })

    it('denies DISCIPULADOR from managing organization', () => {
      expect(canManageOrganization('DISCIPULADOR')).toBe(false)
    })

    it('denies LIDER_CELULA from managing organization', () => {
      expect(canManageOrganization('LIDER_CELULA')).toBe(false)
    })

    it('denies MEMBRO from managing organization', () => {
      expect(canManageOrganization('MEMBRO')).toBe(false)
    })
  })

  describe('canManageMembers', () => {
    it('allows PRESIDENTE to manage members', () => {
      expect(canManageMembers('PRESIDENTE')).toBe(true)
    })

    it('allows PASTOR_PRINCIPAL to manage members', () => {
      expect(canManageMembers('PASTOR_PRINCIPAL')).toBe(true)
    })

    it('denies PASTOR_REDE from managing members', () => {
      expect(canManageMembers('PASTOR_REDE')).toBe(false)
    })

    it('denies DISCIPULADOR from managing members', () => {
      expect(canManageMembers('DISCIPULADOR')).toBe(false)
    })

    it('denies LIDER_CELULA from managing members', () => {
      expect(canManageMembers('LIDER_CELULA')).toBe(false)
    })

    it('denies MEMBRO from managing members', () => {
      expect(canManageMembers('MEMBRO')).toBe(false)
    })
  })
})
