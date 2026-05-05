# Role Authorization Matrix

**Last Updated:** 2026-05-05

This matrix shows which Koinonia organization roles have access to which features and operations across the application. The matrix is based on the permission resolver logic in `apps/api/src/lib/tenant/permission-resolver.ts` and validated against API routes and web UI implementations.

## Quick Reference Matrix

| Role | Create Events | Edit Events | Manage Org | Manage Members | View Org Settings | Create Pessoa | Edit Pessoa | Invite Members | Transfer Presidency | Enroll Other | Self Enroll | View Eventos | View Pessoas |
|------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| PRESIDENTE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ALL_ORG |
| PASTOR_PRINCIPAL | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ALL_ORG |
| PASTOR_REDE | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | OWN_SUBTREE |
| DISCIPULADOR | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | OWN_SUBTREE |
| LIDER_CELULA | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | DIRECT_CHILDREN |
| MEMBRO | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | SELF_ONLY |

### Legend

- **✅** = Role has access to this operation
- **❌** = Role does not have access
- **View Pessoas** column shows the resource visibility scope (ALL_ORG, OWN_SUBTREE, DIRECT_CHILDREN, SELF_ONLY)

## Operation Details & Sources

### Admin Operations (PRESIDENTE, PASTOR_PRINCIPAL only)

These operations require admin role and are restricted to the two leadership roles.

#### Create Events
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL
- **Operation:** `Operation.CREATE_EVENTO`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:7`
- **API Implementation:** Routes marked with `requireRole('admin')` in `apps/api/src/modules/*/routes/*.ts`
- **Web Implementation:** `apps/web/src/pages/EventosPage.tsx:8` - "Novo Evento" button only shows when `canWrite` is true
- **Permission Logic:** Lines 7, 31-33 in permission-resolver.ts
- **Used in:** Event creation flow (EventosPage → EventoForm → CreateEventoUseCase)

#### Edit Events
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL
- **Operation:** `Operation.EDIT_EVENTO`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:8`
- **API Implementation:** PATCH endpoints protected by `requireAdmin` middleware
- **Web Implementation:** `apps/web/src/components/eventos/EventoCard.tsx` - edit button and controls only visible to admin roles
- **Permission Logic:** Lines 8, 31-33 in permission-resolver.ts

#### Manage Organization
- **Roles with Access:** PRESIDENTE only
- **Operation:** Org settings and configuration endpoints
- **Backend Permission Check:** No explicit `Operation` enum yet; implemented via `requireAdmin` + PRESIDENTE-only checks
- **API Implementation:** Admin routes in `apps/api/src/modules/admin/`
- **Web Implementation:** Organization settings pages restricted by `requireRole('admin')` guards
- **Permission Logic:** PRESIDENTE is the only admin role who can modify organization-level settings

#### View Org Settings
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL
- **Operation:** `Operation.VIEW_ORG_SETTINGS`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:18`
- **API Implementation:** Organization information endpoints
- **Web Implementation:** Settings sidebar and org config pages
- **Permission Logic:** Lines 18, 31-33 in permission-resolver.ts

#### Manage Members
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL
- **Operation:** `Operation.INVITE_MEMBER` + `Operation.UPDATE_MEMBER_ROLE`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:11-12`
- **API Implementation:** Member management endpoints in `apps/api/src/modules/*/routes/`
- **Web Implementation:** MembersPage and member management UI
- **Permission Logic:** Lines 11-12, 31-33 in permission-resolver.ts
- **Components:** Apps only show member invite/role update controls to admin roles

#### Invite Members
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL
- **Operation:** `Operation.INVITE_MEMBER`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:11`
- **API Implementation:** POST `/api/v1/organizations/members/invite`
- **Web Implementation:** Invite button in MembersPage
- **Permission Logic:** Line 11 in permission-resolver.ts

#### Transfer Presidency
- **Roles with Access:** PRESIDENTE only
- **Operation:** `Operation.TRANSFER_PRESIDENCY`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:13`
- **API Implementation:** POST `/api/v1/organizations/members/transfer-presidency`
- **Web Implementation:** MembersPage presidency transfer action
- **Permission Logic:** Line 13 in permission-resolver.ts - PRESIDENTE exclusively
- **Risk:** This operation permanently transfers ownership; only the president can delegate it

### Leadership Operations (PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE)

These operations allow senior leadership to create and manage people in the organization.

#### Create Pessoa
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE
- **Operation:** `Operation.CREATE_PESSOA`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:14`
- **API Implementation:** POST `/api/v1/pessoas` with permission check
- **Web Implementation:** Create participant form in ParticipantesPage
- **Permission Logic:** Line 14 in permission-resolver.ts
- **Scope Limitation:** PASTOR_REDE can only create within `OWN_SUBTREE` scope

#### Edit Pessoa
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE, DISCIPULADOR
- **Operation:** `Operation.EDIT_PESSOA`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:15`
- **API Implementation:** PATCH `/api/v1/pessoas/:id` with permission check
- **Web Implementation:** Edit participant form
- **Permission Logic:** Line 15 in permission-resolver.ts
- **Scope Limitation:** DISCIPULADOR can only edit within `OWN_SUBTREE` scope

#### Enroll Other
- **Roles with Access:** PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE, DISCIPULADOR
- **Operation:** `Operation.ENROLL_OTHER`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:16`
- **API Implementation:** POST `/api/v1/eventos/:id/inscricoes` with permission check
- **Web Implementation:** Enroll other button in event details
- **Permission Logic:** Line 16 in permission-resolver.ts
- **Scope Limitation:** Scoped to resource visibility (`canViewPessoas` limits who can be enrolled)

### Universal Operations

#### Self Enroll
- **Roles with Access:** All roles (PRESIDENTE, PASTOR_PRINCIPAL, PASTOR_REDE, DISCIPULADOR, LIDER_CELULA, MEMBRO)
- **Operation:** `Operation.SELF_ENROLL`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:17`
- **API Implementation:** POST `/api/v1/eventos/:id/inscricoes/self`
- **Web Implementation:** "Inscrever-me" button visible to all authenticated users
- **Permission Logic:** Line 17 in permission-resolver.ts - all roles included
- **Note:** The user can only self-enroll in events they can view (visibility not restricted by role for non-planning events)

#### View Eventos
- **Roles with Access:** All roles
- **Operation:** `Operation.SELF_ENROLL` (read), special logic for `canViewEvento()`
- **Backend Permission Check:** `apps/api/src/lib/tenant/permission-resolver.ts:40-47`
- **API Implementation:** GET `/api/v1/eventos` visible to all authenticated users
- **Special Rule:** Events in "planejamento" (planning) status only visible to ADMIN_ROLES (PRESIDENTE, PASTOR_PRINCIPAL)
- **Web Implementation:** EventosPage shows all viewable events, restricted message for non-admins
- **Permission Logic:** Lines 40-47 in permission-resolver.ts

## Resource Visibility by Role (Pessoas Query Scope)

The `canViewPessoas()` function determines the visibility scope for each role when querying the pessoas/participantes list:

| Role | Visibility Scope | Meaning |
|------|:----:|-----------|
| PRESIDENTE | `ALL_ORG` | Can view and manage all people in the organization |
| PASTOR_PRINCIPAL | `ALL_ORG` | Can view and manage all people in the organization |
| PASTOR_REDE | `OWN_SUBTREE` | Can view/manage people in their network and subordinates |
| DISCIPULADOR | `OWN_SUBTREE` | Can view/manage people in their discipleship group and subordinates |
| LIDER_CELULA | `DIRECT_CHILDREN` | Can view/manage only their direct group members |
| MEMBRO | `SELF_ONLY` | Can only view their own record |

**Source:** `apps/api/src/lib/tenant/permission-resolver.ts:21-28`

## Role Mapping to Auth Layer

The `role-mapper.ts` utility maps Koinonia organization roles to generic auth roles for middleware:

```
PRESIDENTE         ──→ 'admin'
PASTOR_PRINCIPAL   ──→ 'admin'
PASTOR_REDE        ──→ 'member'
DISCIPULADOR       ──→ 'member'
LIDER_CELULA       ──→ 'member'
MEMBRO             ──→ 'member'
```

**Source:** `apps/api/src/lib/tenant/role-mapper.ts:9-11`

This mapping is applied by the TenantMiddleware and sets `request.user.role` for downstream `requireRole()` checks.

## How to Use This Matrix

### For Developers Adding New Features

1. **Determine which roles should access the feature**
   - Admin-only features? → Use `ADMIN_ROLES` (PRESIDENTE, PASTOR_PRINCIPAL)
   - Leadership-plus? → Add your role set to permission-resolver.ts
   - Scope-limited? → Also implement a scope rule in `canViewPessoas` or equivalent

2. **Add the operation to types.ts**
   ```typescript
   // In apps/api/src/lib/tenant/types.ts
   export const Operation = {
     // ...existing operations
     NEW_FEATURE: 'NEW_FEATURE',
   }
   ```

3. **Add permission rule to permission-resolver.ts**
   ```typescript
   // In apps/api/src/lib/tenant/permission-resolver.ts
   const PERMISSIONS: Record<Operation, OrgRole[]> = {
     // ...existing rules
     [Operation.NEW_FEATURE]: [OrgRole.PRESIDENTE, OrgRole.PASTOR_PRINCIPAL],
   }
   ```

4. **Protect the API endpoint**
   ```typescript
   // In your routes file
   const requireAdmin = { preHandler: [requireRole('admin')] }
   
   server.post('/api/v1/new-feature', requireAdmin, async (request, reply) => {
     // Your handler
   })
   ```

5. **Check permission in web UI**
   ```typescript
   // In your component
   const { userRole } = useOrgContext()
   const canAccess = canPerform(userRole, Operation.NEW_FEATURE)
   
   if (!canAccess) return null // Hide UI element
   ```

6. **Update this matrix** with the new operation and role access

### For Code Reviewers

- Check that `Operation.*` enum is defined in `types.ts`
- Check that permission rule exists in `permission-resolver.ts`
- Check that API routes use `requireRole('admin')` or equivalent guard
- Check that web components respect the permission logic
- Verify that resource visibility scope matches the role's `canViewPessoas()` scope

### For Auditors

- Cross-reference each row in the matrix with actual code
- Verify that API routes implement the declared permissions
- Verify that web UI components respect role restrictions
- Check that organization middleware properly loads and maps roles

## Testing & Verification

The permission resolver logic is tested in:
- `apps/api/src/lib/tenant/permission-resolver.test.ts` - Unit tests for all operations and roles
- `apps/api/src/tests/rbac.test.ts` - Integration tests for role-based access control

Key test assertions verify:
- ✅ `canPerform(PRESIDENTE, operation)` returns correct boolean
- ✅ `canPerform(MEMBRO, operation)` returns correct boolean
- ✅ `canViewPessoas(role)` returns correct scope
- ✅ `canViewEvento(role, status)` enforces planning visibility

## Known Limitations & Gaps

### Phase 8.5 Transition State

During the multi-tenant transition, some patterns are still in development:

1. **Org-scoped queries**: All API endpoints enforce tenant context via middleware, but some legacy flows still use `DEFAULT_ORGANIZATION_ID` fallback at the controller boundary
   - Status: ✅ Transitional pattern documented in MEMORY.md
   - Target: Remove fallback once all client flows activate organization first

2. **Planning event visibility**: Only admin roles can view events in "planejamento" status
   - Risk: Need to verify E2E that planning events don't leak to lower roles
   - Status: Permission logic is in place; awaiting UAT

3. **Recursive scope queries**: PASTOR_REDE and DISCIPULADOR scope to `OWN_SUBTREE`, but the "subtree" definition depends on the organizational hierarchy structure (e.g., `pessoas.lider_pessoa_id` chain)
   - Risk: Query complexity; may need optimization for large organizations
   - Status: Awaiting performance testing in UAT

## Future Enhancements

- [ ] Add operation-scoped permissions (e.g., "CAN_DELETE_EVENT_IF_AUTHOR")
- [ ] Add time-based permissions (e.g., "can edit within 24 hours of creation")
- [ ] Add approval-required operations (e.g., "CREATE_PERSON requires PASTOR_PRINCIPAL approval")
- [ ] Add delegation capabilities (e.g., "PRESIDENTE can delegate CREATE_EVENTO to PASTOR_REDE")

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-05 | Initial matrix created from Phase 8.5 permission resolver audit | Claude Code |
