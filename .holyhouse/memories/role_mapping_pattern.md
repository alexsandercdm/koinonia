---
name: Role Mapping Pattern
description: Two-layer role system requires mapping Koinonia org roles to auth layer roles
type: project
---

## Overview

Role mapping pattern: Koinonia org roles (PRESIDENTE, PASTOR_PRINCIPAL, etc.) must be mapped to Better Auth roles (admin/member) for authorization middleware to work correctly.

## Why Two Layers Exist

The system has two distinct role layers:

1. **Koinonia Domain Roles** — Stored in organization membership (member table)
   - PRESIDENTE: Organization president with full authority
   - PASTOR_PRINCIPAL: Senior pastor with administrative access
   - PASTOR_REDE: Network/regional pastor
   - DISCIPULADOR: Discipler with mentoring authority
   - LIDER_CELULA: Cell leader with group authority
   - MEMBRO: Regular member with limited permissions

2. **Better Auth Roles** — Used for authorization middleware checks (request.user.role)
   - admin: Maps to PRESIDENTE, PASTOR_PRINCIPAL
   - member: Maps to all other Koinonia roles

Why this split? Downstream middleware like `requireRole('admin')` checks `request.user.role`, not the org membership table directly. For authorization to work, `request.user.role` must be populated with the mapped Better Auth role before the middleware runs.

## Current Implementation

**API Layer (TenantMiddleware)**:
- Located: `apps/api/src/middleware/tenant.ts`
- Flow: TenantMiddleware fetches member record, extracts Koinonia org role, maps it to Better Auth role, sets `request.user.role = mapOrgRoleToAuthRole(orgRole)`
- Mapping function: `mapOrgRoleToAuthRole()` in `apps/api/src/lib/role-mapper.ts`
- Result: Legacy middleware routes using `requireRole('admin'|'lider')` can now check `request.user.role` and get the mapped auth role

**Web Layer (OrgContext)**:
- Located: `apps/web/src/contexts/org-context.tsx`
- Flow: User loads OrgContext; hook `useActiveMember()` fetches member record from Better Auth organizations endpoint
- Access: Components use `OrgContext.userRole` which reads from the member role directly (Koinonia domain role)
- Note: Web layer does NOT map to Better Auth roles; it reads the native Koinonia role for UI decisions

## How to Apply

### For API Middleware Routes

When adding new authorization checks to API endpoints:

1. **Check for tenant context first** (required):
   ```typescript
   if (!request.tenantCtx) {
     return error(401, 'No active organization');
   }
   ```

2. **Use `canPerform()` for domain operations**:
   ```typescript
   if (!permissionResolver.canPerform(request.tenantCtx.userRole, 'CREATE_EVENTO')) {
     return error(403, 'Insufficient permissions');
   }
   ```

3. **If using legacy `requireRole()` middleware**, understand that `request.user.role` contains the mapped auth role:
   - `PRESIDENTE` and `PASTOR_PRINCIPAL` → `request.user.role === 'admin'`
   - All others → `request.user.role === 'member'`
   - Mapping is handled automatically by TenantMiddleware

### For Web Components

When adding new authorization checks to web pages:

1. **Get the active member context**:
   ```typescript
   const { activeOrgId, userRole } = useOrgContext();
   ```

2. **Check Koinonia roles directly** (no mapping needed):
   ```typescript
   if (userRole === 'PRESIDENTE' || userRole === 'PASTOR_PRINCIPAL') {
     // Show admin panel
   }
   ```

3. **Use `useCanPerform()` hook for complex operations** (if needed):
   ```typescript
   const canCreateEvent = useCanPerform('CREATE_EVENTO', userRole);
   ```

### When Adding New Role Checks

1. **Add the mapping function to `apps/api/src/lib/role-mapper.ts`** — never inline role logic
2. **Import and call the utility** in TenantMiddleware and use cases
3. **Document the decision** in this memory file if the pattern changes

## References

- **API role mapping**: `apps/api/src/lib/tenant/role-mapper.ts`
- **Middleware population**: `apps/api/src/middleware/tenant.ts` (sets `request.user.role`)
- **Permission resolver**: `apps/api/src/lib/tenant/permission-resolver.ts` (domain RBAC)
- **Web org context**: `apps/web/src/contexts/org-context.tsx` (stores Koinonia role directly)
- **Better Auth config**: `apps/api/src/config/auth.ts` (organization plugin with Koinonia roles)

## Key Decision

**Do not map roles on the web layer** — use Koinonia roles directly for UI decisions. **Do map roles on the API layer** — `request.user.role` must match what middleware expects. This split keeps the domain model clean on the web while satisfying the Better Auth authorization contract on the API.
