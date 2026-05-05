# Role Authorization Matrix

**Last Updated:** 2026-05-05

This matrix shows which Koinonia organization roles have access to which features and operations.

## Quick Reference

| Role | Create Events | Edit Events | Manage Org | Manage Members | View Events |
|------|:-------------:|:-----------:|:----------:|:--------------:|:-----------:|
| PRESIDENTE | ✅ | ✅ | ✅ | ✅ | ✅ |
| PASTOR_PRINCIPAL | ✅ | ✅ | ❌ | ✅ | ✅ |
| PASTOR_REDE | ❌ | ❌ | ❌ | ❌ | ✅ |
| DISCIPULADOR | ❌ | ❌ | ❌ | ❌ | ✅ |
| LIDER_CELULA | ❌ | ❌ | ❌ | ❌ | ✅ |
| MEMBRO | ❌ | ❌ | ❌ | ❌ | ✅ |

## Operation Details

### Create Events
- **Allowed Roles:** PRESIDENTE, PASTOR_PRINCIPAL
- **Source:** `apps/api/src/lib/tenant/role-mapper.ts:12` (`canCreateEvents()`)
- **API Implementation:** POST `/api/v1/eventos` requires admin role
- **Web Implementation:** `apps/web/src/pages/EventosPage.tsx:33` checks role before showing button

### Edit Events
- **Allowed Roles:** PRESIDENTE, PASTOR_PRINCIPAL  
- **Source:** `apps/api/src/lib/tenant/role-mapper.ts:12` (`canCreateEvents()`)
- **API Implementation:** PATCH `/api/v1/eventos/:id` requires admin role
- **Web Implementation:** Event card shows edit button for admin roles only

### Manage Organization
- **Allowed Roles:** PRESIDENTE only
- **Source:** `apps/api/src/lib/tenant/role-mapper.ts:19` (`canManageOrganization()`)
- **API Implementation:** Organization endpoints require PRESIDENTE
- **Web Implementation:** Organization settings available to PRESIDENTE only

### Manage Members
- **Allowed Roles:** PRESIDENTE, PASTOR_PRINCIPAL
- **Source:** `apps/api/src/lib/tenant/role-mapper.ts:25` (`canManageMembers()`)
- **API Implementation:** Member management endpoints require admin role
- **Web Implementation:** Member UI available to admin roles

### View Events
- **Allowed Roles:** All roles
- **Source:** No role restriction - authenticated users only
- **API Implementation:** GET `/api/v1/eventos` - tenant context required
- **Web Implementation:** EventosPage accessible to all authenticated users

## How to Use

This matrix is a reference for:
- Developers implementing new features (check role requirements)
- Code reviewers (verify proper role checks are in place)
- Testing teams (test features with different roles)

## Adding New Operations

To add a new operation:
1. Add the operation name to the Quick Reference table
2. Determine which roles should have access (ADMIN_ROLES = PRESIDENTE + PASTOR_PRINCIPAL, or specific roles)
3. Implement the permission check using `mapOrgRoleToAuthRole()` in `role-mapper.ts`
4. Update this matrix with source file references
5. Add tests to verify role checks work correctly
