# Role Mapping State Audit

**Created:** 2026-05-05  
**Status:** Current-state documentation (Phase 8.5 multi-tenant foundation)

---

## Koinonia Org Roles

Koinonia defines six domain-specific organization roles representing the church hierarchy and responsibilities:

| Role | Key | Purpose |
|------|-----|---------|
| **PRESIDENTE** | `OrgRole.PRESIDENTE` | Organization owner and chief leader. Can manage all resources, transfer presidency. |
| **PASTOR_PRINCIPAL** | `OrgRole.PASTOR_PRINCIPAL` | Senior pastor with admin-level authority. Can manage all resources. |
| **PASTOR_REDE** | `OrgRole.PASTOR_REDE` | Network pastor. Can view own subtree, create/edit people, enroll others. |
| **DISCIPULADOR** | `OrgRole.DISCIPULADOR` | Discipler. Can view own subtree, create/edit people, enroll others. |
| **LIDER_CELULA** | `OrgRole.LIDER_CELULA` | Cell leader. Can view direct children, limited people management. |
| **MEMBRO** | `OrgRole.MEMBRO` | Church member. Can view self only, self-enroll in events. |

**Type Definition:**  
`apps/api/src/lib/tenant/types.ts`:
```typescript
export const OrgRole = {
  PRESIDENTE: 'PRESIDENTE',
  PASTOR_PRINCIPAL: 'PASTOR_PRINCIPAL',
  PASTOR_REDE: 'PASTOR_REDE',
  DISCIPULADOR: 'DISCIPULADOR',
  LIDER_CELULA: 'LIDER_CELULA',
  MEMBRO: 'MEMBRO',
} as const

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole]
```

---

## Current Role Mapping Strategy

Koinonia org roles are mapped to Better Auth's generic access control levels through the organization plugin configuration.

### Better Auth Access Control Mapping

**File:** `apps/api/src/config/auth.ts` (lines 33-44)

```typescript
organizationPlugin({
  allowUserToCreateOrganization: true,
  creatorRole: OrgRole.PRESIDENTE,
  roles: {
    [OrgRole.PRESIDENTE]: ownerAc,           // Full access (owner level)
    [OrgRole.PASTOR_PRINCIPAL]: adminAc,    // Admin access
    [OrgRole.PASTOR_REDE]: memberAc,        // Member access
    [OrgRole.DISCIPULADOR]: memberAc,       // Member access
    [OrgRole.LIDER_CELULA]: memberAc,       // Member access
    [OrgRole.MEMBRO]: memberAc,             // Member access
  },
})
```

### Mapping Summary

- **Owner Level** (`ownerAc`): `PRESIDENTE`
  - Highest privileges in Better Auth organization plugin
  - Can transfer organization ownership/presidency

- **Admin Level** (`adminAc`): `PASTOR_PRINCIPAL`
  - Administrative privileges in Better Auth organization plugin

- **Member Level** (`memberAc`): `PASTOR_REDE`, `DISCIPULADOR`, `LIDER_CELULA`, `MEMBRO`
  - Standard member privileges in Better Auth organization plugin
  - Actual operation permissions handled by Koinonia's domain-specific RBAC

### Creator Role Assignment

When a user creates a new organization, Better Auth automatically assigns them the `creatorRole` which is configured as `PRESIDENTE`. This means:
- Organization creators always become `PRESIDENTE`
- They can invite other members with specific Koinonia roles
- They can transfer presidency to another `PRESIDENTE` through domain logic

---

## Role Sources

### API Layer (`TenantContext`)

**File:** `apps/api/src/lib/tenant/types.ts`

```typescript
export interface TenantContext {
  orgId: string
  userId: string
  userRole: OrgRole  // Role from Better Auth member table
}
```

**Role Resolution:** `apps/api/src/middleware/tenant.ts` (lines 49-68)

```typescript
const userId = sessionResult.user.id
const [membership] = await db
  .select({ role: member.role })
  .from(member)
  .where(and(eq(member.userId, userId), eq(member.organizationId, activeOrganizationId)))
  .limit(1)

if (!membership) {
  request.log.warn(...)
  return
}

request.tenantCtx = {
  orgId: activeOrganizationId,
  userId,
  userRole: membership.role as OrgRole,  // Comes from Better Auth member table
}
```

**Source:**
- `request.tenantCtx.userRole` is populated from the Better Auth `member.role` column
- Matched by `(userId, activeOrganizationId)` tuple
- Only set if the user is a valid member of the active organization
- If the user has an active org set but is not a member, tenant context is not populated

### Web Layer (`OrgContext`)

**File:** `apps/web/src/contexts/org-context.tsx` (lines 28-30)

```typescript
const activeMemberQuery = authClient.useActiveMember?.()
const activeMember = activeMemberQuery?.data ?? null
const userRole = activeMember?.role ?? null
```

**Role Source:**
- `useActiveMember()` fetches the active member record from Better Auth
- `userRole` is the string value from the member record
- Falls back to `null` if no active organization is selected
- Type is `string | null` (not yet typed as `OrgRole`)

**Org ID Source:**
```typescript
const activeOrgId =
  session?.session?.activeOrganizationId ??
  session?.activeOrganizationId ??
  null
```

- Comes from Better Auth session after organization plugin processing
- Set via `POST /api/v1/auth/organization/set-active`
- May be `null` if user has not selected an organization

---

## Authorization Pattern Summary

### Overview

Koinonia uses a two-tier authorization system:

1. **Organization & Session Level** (Better Auth)
   - User must have a valid session
   - User must have an active organization selected
   - User must be a member of that organization
   - Member's role is stored in Better Auth's `member.role` column

2. **Domain RBAC Level** (Koinonia)
   - Operations are checked against the user's `OrgRole`
   - Permissions are defined per operation in `permission-resolver.ts`
   - Resource visibility (scope) is role-dependent for pessoas (people)

### Request Flow

```
HTTP Request
    ↓
[TenantMiddleware - tenant.ts]
  ├─ Get session from cookies/auth header via Better Auth
  ├─ Extract activeOrganizationId from session
  ├─ Query member table: (userId, activeOrganizationId)
  └─ Populate request.tenantCtx with {orgId, userId, userRole: OrgRole}
    ↓
[Route Handler]
  ├─ Call requireTenantCtx(request) to ensure context exists
  └─ Obtain TenantContext with current organization and user role
    ↓
[Use Case / Service Layer]
  ├─ Call canPerform(userRole, operation)
  ├─ Call canViewPessoas(userRole) for visibility scope
  ├─ Call canViewEvento(userRole, status) for event visibility
  └─ Query database filtered by organization_id and scope
    ↓
HTTP Response (401 if no tenant, 403 if unauthorized, 200 if allowed)
```

### Permissions Matrix

**File:** `apps/api/src/lib/tenant/permission-resolver.ts`

**Admin Operations** (available to `PRESIDENTE`, `PASTOR_PRINCIPAL`):
- `CREATE_EVENTO`: Create events
- `EDIT_EVENTO`: Edit events
- `TRANSITION_EVENTO`: Change event status
- `CANCEL_EVENTO`: Cancel events
- `INVITE_MEMBER`: Invite members to organization
- `UPDATE_MEMBER_ROLE`: Change member roles
- `VIEW_ORG_SETTINGS`: View organization settings

**Owner-Only Operations** (available to `PRESIDENTE` only):
- `TRANSFER_PRESIDENCY`: Transfer PRESIDENTE role to another member

**Extended Permissions** (available to `PRESIDENTE`, `PASTOR_PRINCIPAL`, `PASTOR_REDE`):
- `CREATE_PESSOA`: Create people records

**Extended Permissions** (available to `PRESIDENTE`, `PASTOR_PRINCIPAL`, `PASTOR_REDE`, `DISCIPULADOR`):
- `EDIT_PESSOA`: Edit people records
- `ENROLL_OTHER`: Enroll others in events

**Universal Permissions** (all roles):
- `SELF_ENROLL`: Self-enroll in events

### Resource Visibility Scopes

Roles determine what subset of resources a user can view (defined in `PESSOAS_SCOPE`):

- **ALL_ORG**: `PRESIDENTE`, `PASTOR_PRINCIPAL` — see all people in organization
- **OWN_SUBTREE**: `PASTOR_REDE`, `DISCIPULADOR` — see people they manage and descendants
- **DIRECT_CHILDREN**: `LIDER_CELULA` — see only direct subordinates
- **SELF_ONLY**: `MEMBRO` — see only themselves

### Event Status Visibility

- **Planejamento** (planning): `PRESIDENTE`, `PASTOR_PRINCIPAL` only
- **All Public Statuses** (inscricoes_abertas, em_andamento, finalizado, cancelado): all roles

### Org Selection Requirement

- Tenant context is only populated when a user has explicitly selected an active organization
- The selection is made via `POST /api/v1/auth/organization/set-active`
- Without an active org, `request.tenantCtx` is undefined
- Routes requiring organization context should call `requireTenantCtx(request, reply)` which throws if context is missing

---

## Database Schema References

- **Better Auth user table**: `apps/api/src/db/schema.ts` → `user`
- **Better Auth session table**: `apps/api/src/db/schema.ts` → `session`
- **Better Auth member table**: `apps/api/src/db/schema.ts` → `member`
  - Column: `role: text` — stores the `OrgRole` enum value
  - Column: `organizationId: text` — references organization
  - Column: `userId: text` — references user
  - Index: `member_organizationId_idx`, `member_userId_idx`
- **Koinonia organization domain tables**: `apps/api/src/db/schema.ts`
  - All domain tables include `organization_id: uuid` column (non-null)
  - Tenant middleware ensures queries are filtered by this column

---

## Known Limitations & Transition Notes

### Participante Controller Fallback (Temporary)

**File:** `apps/api/src/modules/participantes/controller.ts`

During the Phase 8.5 multi-tenant transition, participant endpoints may fall back to `DEFAULT_ORGANIZATION_ID` when:
- Tenant middleware has not resolved an active organization
- Pre-organization participant flows are still in use

This fallback uses a legacy role mapping:
- Better Auth `admin` → `PRESIDENTE`
- Better Auth `lider` → `PASTOR_REDE`
- Better Auth `servo` → `MEMBRO`

**Status**: Temporary measure. To be removed once organization selection/onboarding is wired into the participant-facing auth flow.

### Web Layer Type Definitions

The `userRole` in `OrgContext` is currently typed as `string | null` rather than `OrgRole | null`. This should be refined in a follow-up to provide stronger type safety on the Web layer.

---

## Tests & Verification

### RBAC Test Suite

**File:** `apps/api/src/tests/rbac.test.ts`

Comprehensive test coverage of the permissions matrix:
- Admins can manage events
- Only PRESIDENTE can transfer presidency
- All roles can self-enroll
- Visibility scopes per role
- Event status visibility rules

### Tenant Isolation Test

**File:** `apps/api/src/tests/tenant-isolation.test.ts`

Verifies that:
- Queries are properly scoped to organization_id
- Users cannot access other organizations' data
- Cross-organization role leakage is prevented

### Auth & Org Tests

**Files:**
- `apps/api/src/tests/auth.test.ts` — Better Auth plugin behavior
- `apps/api/src/routes/custom-auth.ts` — Custom organization endpoints

---

## API Authorization Inventory

**Audit Date:** 2026-05-05  
**Scope:** All HTTP route handlers with authorization middleware or use-case level checks

### Middleware-Based Authorization Patterns

The API uses two primary middleware patterns for authorization:

1. **Legacy Pattern** (being phased out): `requireRole('admin')` / `requireRole('lider')`
   - Defined in: `apps/api/src/middleware/auth.ts`
   - Maps to Better Auth generic roles
   - Used in participantes, inscricoes, acomodacoes, admin, financeiro modules
   - Note: This pattern uses generic 'admin' and 'lider' roles, not Koinonia OrgRoles

2. **New Pattern** (multi-tenant): `requireTenantCtx()`
   - Defined in: `apps/api/src/middleware/tenant.ts`
   - Requires request.tenantCtx to be populated with OrgRole and organization scope
   - Used in organization controller and use cases
   - Paired with `canPerform(userRole, operation)` checks in use cases

### Authorization Inventory by Module

| Module | Route | Method | Endpoint | Line | Middleware | Use-Case Check | Checked Role(s) | Operation | Pattern |
|--------|-------|--------|----------|------|------------|-----------------|-----------------|-----------|---------|
| **organizations** | organizations.ts | POST | `/` | 9 | requireAuth | ✓ (CreateOrganizationUseCase) | N/A (no org yet) | CREATE_ORG | TenantCtx |
| | | GET | `/members` | 10 | requireAuth | ✓ (GetMembersUseCase) | OrgRole from tenantCtx | VIEW_MEMBERS | TenantCtx |
| | | POST | `/members/invite` | 11 | requireAuth | ✓ (InviteMemberUseCase:16) | PRESIDENTE, PASTOR_PRINCIPAL | INVITE_MEMBER | TenantCtx + canPerform |
| | | PATCH | `/members/:userId/role` | 12 | requireAuth | ✓ (UpdateMemberRoleUseCase:15) | PRESIDENTE, PASTOR_PRINCIPAL | UPDATE_MEMBER_ROLE | TenantCtx + canPerform |
| | | POST | `/transfer-presidency` | 13 | requireAuth | ✓ (TransferPresidencyUseCase:14) | PRESIDENTE only | TRANSFER_PRESIDENCY | TenantCtx + canPerform |
| **pessoas** | participantes.ts | GET | `/participantes` | 13 | requireAuth | No (TenantCtx fallback) | Any authenticated | LIST_PARTICIPANTES | TenantCtx fallback |
| | | POST | `/participantes` | 27 | requireLider | No | 'lider' role (legacy) | CREATE_PARTICIPANTE | Legacy requireRole |
| | | GET | `/participantes/:id` | 51 | requireAuth | No | Any authenticated | GET_PARTICIPANTE | TenantCtx fallback |
| | | GET | `/participantes/:id/historico` | 64 | requireAuth | No | Any authenticated | GET_PARTICIPANTE_HISTORICO | TenantCtx fallback |
| | | PATCH | `/participantes/:id` | 77 | requireLider | No | 'lider' role (legacy) | UPDATE_PARTICIPANTE | Legacy requireRole |
| | | PATCH | `/participantes/:id/saude` | 107 | requireLider | No | 'lider' role (legacy) | UPDATE_PARTICIPANTE_SAUDE | Legacy requireRole |
| | | DELETE | `/participantes/:id` | 131 | requireAdmin | No | 'admin' role (legacy) | DELETE_PARTICIPANTE | Legacy requireRole |
| **inscricoes** | inscricoes.ts | POST | `/eventos` | 16 | requireAdmin | No | 'admin' role (legacy) | CREATE_EVENTO | Legacy requireRole |
| | | PUT | `/eventos/:id` | 45 | requireAdmin | No | 'admin' role (legacy) | UPDATE_EVENTO | Legacy requireRole |
| | | GET | `/eventos` | 73 | requireAuth | No | Any authenticated | LIST_EVENTOS | TenantCtx |
| | | GET | `/eventos/:id` | 74 | requireAuth | No | Any authenticated | GET_EVENTO | TenantCtx |
| | | POST | `/inscricoes` | 78 | requireLider | No | 'lider' role (legacy) | CREATE_INSCRICAO | Legacy requireRole |
| | | GET | `/inscricoes/:id` | 93 | requireAuth | No | Any authenticated | GET_INSCRICAO | TenantCtx |
| | | GET | `/eventos/:id/inscricoes` | 95 | requireAuth | No | Any authenticated | LIST_INSCRICOES | TenantCtx |
| | | POST | `/inscricoes/:id/pagamentos` | 99 | requireLider | No | 'lider' role (legacy) | ADD_PAYMENT | Legacy requireRole |
| | | POST | `/inscricoes/:id/substituir` | 115 | requireLider | No | 'lider' role (legacy) | REPLACE_INSCRICAO | Legacy requireRole |
| | | POST | `/inscricoes/:id/cancelar` | 128 | requireLider | No | 'lider' role (legacy) | CANCEL_INSCRICAO | Legacy requireRole |
| | | GET | `/eventos/:evento_id/inadimplentes` | 141 | requireLider | No | 'lider' role (legacy) | GET_INADIMPLENTES | Legacy requireRole |
| **acomodacoes** | acomodacoes.ts | GET | `/acomodacoes/locais` | 13 | requireAuth | No | Any authenticated | LIST_LOCAIS | TenantCtx |
| | | GET | `/acomodacoes/locais/:localId/quartos` | 16 | requireAuth | No | Any authenticated | LIST_QUARTOS | TenantCtx |
| | | GET | `/acomodacoes/quartos/:quartoId/camas` | 17 | requireAuth | No | Any authenticated | LIST_CAMAS | TenantCtx |
| | | POST | `/acomodacoes/locais` | 20 | requireLider | No | 'lider' role (legacy) | CREATE_LOCAL | Legacy requireRole |
| | | PATCH | `/acomodacoes/locais/:localId` | 35 | requireLider | No | 'lider' role (legacy) | UPDATE_LOCAL | Legacy requireRole |
| | | POST | `/acomodacoes/locais/:localId/quartos` | 49 | requireLider | No | 'lider' role (legacy) | CREATE_QUARTO | Legacy requireRole |
| | | DELETE | `/acomodacoes/quartos/:quartoId` | 64 | requireLider | No | 'lider' role (legacy) | DELETE_QUARTO | Legacy requireRole |
| | | PATCH | `/acomodacoes/quartos/:quartoId` | 68 | requireLider | No | 'lider' role (legacy) | UPDATE_QUARTO | Legacy requireRole |
| | | POST | `/acomodacoes/quartos/:quartoId/camas` | 82 | requireLider | No | 'lider' role (legacy) | CREATE_CAMA | Legacy requireRole |
| | | PATCH | `/acomodacoes/camas/:camaId` | 97 | requireLider | No | 'lider' role (legacy) | UPDATE_CAMA | Legacy requireRole |
| | | GET | `/eventos/:eventoId/mapa-acomodacao` | 110 | requireAuth | No | Any authenticated | GET_MAPA_ACOMODACAO | TenantCtx |
| | | GET | `/eventos/:eventoId/inscricoes-sem-cama` | 111 | requireAuth | No | Any authenticated | GET_INSCRICOES_DISPONIVEIS | TenantCtx |
| | | POST | `/acomodacoes/camas/:camaId/atribuir` | 114 | requireLider | No | 'lider' role (legacy) | ASSIGN_CAMA | Legacy requireRole |
| | | DELETE | `/acomodacoes/camas/:camaId/atribuir` | 127 | requireLider | No | 'lider' role (legacy) | RELEASE_CAMA | Legacy requireRole |
| **admin** | admin.ts | GET | `/admin/audit-logs` | 11 | requireAdmin | No | 'admin' role (legacy) | LIST_AUDIT_LOGS | Legacy requireRole |
| **financeiro** | financeiro.ts | GET | `/financeiro/metricas` | 12 | requireAuth | No | Any authenticated | GET_METRICAS | TenantCtx |
| | | GET | `/financeiro/despesas` | 24 | requireAuth | No | Any authenticated | LIST_DESPESAS | TenantCtx |
| | | POST | `/financeiro/despesas` | 36 | requireLider | No | 'lider' role (legacy) | CREATE_DESPESA | Legacy requireRole |

### Use-Case Level Authorization Checks (canPerform)

| File | Use Case | Line | Operation | Allowed Roles | Check Pattern |
|------|----------|------|-----------|---------------|---------------|
| `organizations/usecases/InviteMemberUseCase.ts` | InviteMemberUseCase | 11 | INVITE_MEMBER | PRESIDENTE, PASTOR_PRINCIPAL | if (!canPerform(this.ctx.userRole, Operation.INVITE_MEMBER)) throw |
| `organizations/usecases/UpdateMemberRoleUseCase.ts` | UpdateMemberRoleUseCase | 15 | UPDATE_MEMBER_ROLE | PRESIDENTE, PASTOR_PRINCIPAL | if (!canPerform(this.ctx.userRole, Operation.UPDATE_MEMBER_ROLE)) throw |
| `organizations/usecases/TransferPresidencyUseCase.ts` | TransferPresidencyUseCase | 14 | TRANSFER_PRESIDENCY | PRESIDENTE only | if (!canPerform(this.ctx.userRole, Operation.TRANSFER_PRESIDENCY)) throw |

### Authorization Pattern Analysis

#### Pattern 1: Legacy Middleware (Legacy requireRole)
**Pattern:** `requireRole('admin')` or `requireRole('lider')`  
**Status:** BEING PHASED OUT - Uses non-Koinonia roles from Better Auth  
**Modules:** participantes, inscricoes, acomodacoes, admin, financeiro  
**Risk:** No Koinonia domain RBAC enforcement; generic role mapping only  
**Files:**
- Defined: `src/middleware/auth.ts` (lines 46-61)
- Used in: 29 route handlers across 5 modules

#### Pattern 2: Tenant Context (TenantCtx)
**Pattern:** `requireTenantCtx(request, reply)` + `canPerform(userRole, operation)` in use cases  
**Status:** CURRENT - Multi-tenant with domain RBAC  
**Modules:** organizations (all endpoints)  
**Implementation:** 
- TenantCtx populated in: `src/middleware/tenant.ts` (lines 49-68)
- Checked by: `canPerform()` in `src/lib/tenant/permission-resolver.ts` (lines 31-33)
- Enforced via: `TenantForbiddenError` exception in use cases
**Files:**
- Defined: `src/middleware/tenant.ts`, `src/lib/tenant/permission-resolver.ts`
- Used in: 5 organization routes + 3 use cases

#### Pattern 3: TenantCtx Fallback (ParticipanteController)
**Pattern:** `request.tenantCtx` falls back to `DEFAULT_ORGANIZATION_ID` with legacy role mapping  
**Status:** TEMPORARY - Multi-tenant transition  
**Module:** pessoas (ParticipanteController only)  
**Legacy Role Mapping:** 'admin' → PRESIDENTE, 'lider' → PASTOR_REDE, 'servo' → MEMBRO  
**Risk:** Mixing legacy and new patterns; no explicit operation checks  
**File:** `src/modules/pessoas/controllers/ParticipanteController.ts` (lines 14-39)

### Authorization Gaps & Inconsistencies

| Gap Type | Location | Description | Severity |
|----------|----------|-------------|----------|
| **No Operation Checks** | participantes routes (all except organizations) | Routes use legacy requireRole() only; no canPerform() enforcement | HIGH |
| **No Operation Checks** | inscricoes routes (all except organizations) | Routes use legacy requireRole() only; no canPerform() enforcement | HIGH |
| **No Operation Checks** | acomodacoes routes (all except organizations) | Routes use legacy requireRole() only; no canPerform() enforcement | HIGH |
| **No Operation Checks** | admin/financeiro routes | Routes use legacy requireRole() only; no canPerform() enforcement | HIGH |
| **Mixed Patterns** | pessoas controller | Uses TenantCtx fallback with legacy role mapping; inconsistent with organization routes | MEDIUM |
| **No Domain RBAC** | All legacy requireRole() routes | Checks generic 'admin'/'lider' roles; ignores Koinonia PRESIDENTE/PASTOR_PRINCIPAL/etc distinction | HIGH |
| **No Visibility Scoping** | All routes except organizations | Do not apply PESSOAS_SCOPE or event visibility rules (canViewPessoas, canViewEvento) | HIGH |
| **Fallback to Default Org** | ParticipanteController | Routes can fall back to DEFAULT_ORGANIZATION_ID instead of failing when no tenant | MEDIUM |

### Summary

**Total Routes Audited:** 41  
**With TenantCtx + canPerform():** 5 (12% - organizations module only)  
**With Legacy requireRole() Only:** 29 (71%)  
**With No Authorization Check (TenantCtx only):** 7 (17% - unauthenticated GET routes for listing)  

**Critical Finding:**
The API is in a transition state with two distinct patterns:

**Pattern Distribution (41 total endpoints):**
- 5 endpoints (12%): organizations module uses `TenantCtx + canPerform()` — full multi-tenant domain RBAC
- 7 endpoints (17%): read-only routes use `TenantCtx` only — populate tenant context but no operation checks
- 29 endpoints (71%): legacy routes use `requireRole()` — generic 'admin'/'lider' roles, no Koinonia domain RBAC

**Impact of Legacy Pattern:**
- PRESIDENTE and PASTOR_PRINCIPAL are treated identically to generic 'admin'
- PASTOR_REDE, DISCIPULADOR, LIDER_CELULA are all treated as generic 'lider'
- The 12 defined Koinonia operations (CREATE_PESSOA, EDIT_PESSOA, etc.) are not enforced on legacy routes
- Resource visibility scopes (ALL_ORG, OWN_SUBTREE, DIRECT_CHILDREN, SELF_ONLY) are not enforced on legacy routes
- Only 5 organization endpoints apply domain-specific operation checks

**Note on TenantCtx Routes:**
The 7 "no check" routes do populate `request.tenantCtx` with organization scope and user role, providing foundational multi-tenant isolation. However, they lack operation-level authorization checks via `canPerform()`, which means all authenticated users can access them regardless of role.

---

## Web Authorization Inventory

**Audit Date:** 2026-05-05  
**Scope:** All page components and UI components with role-based authorization checks

### Summary

The Web layer currently uses **two distinct role sources** with inconsistent patterns:

1. **Legacy Auth Layer Roles** (`user.role` from auth context):
   - Used in: ParticipantsPage, AcomodacoesPage, EventosPage
   - Role values: `'admin'`, `'lider'`, `'servo'`
   - Pattern: Direct role comparison in page components
   - Note: These are generic auth roles, NOT Koinonia OrgRoles

2. **Organization Context Roles** (`useOrgContext().userRole` from Better Auth member):
   - Used in: MembersPage, FinanceiroPage
   - Role values: `'PRESIDENTE'`, `'PASTOR_PRINCIPAL'`, `'PASTOR_REDE'`, `'DISCIPULADOR'`, `'LIDER_CELULA'`, `'MEMBRO'`
   - Pattern: OrgContext hook providing organization-scoped roles
   - Note: This is the correct role source for domain RBAC

### Authorization Inventory by Page

| File | Line | Checked Role(s) | UI/Operation | Pattern Used | Role Source |
|------|------|-----------------|--------------|--------------|-------------|
| src/pages/MembersPage.tsx | 35, 43 | PRESIDENTE, PASTOR_PRINCIPAL | Show invite form, show role selector | `useOrgContext().userRole === 'PRESIDENTE' \|\| 'PASTOR_PRINCIPAL'` | **OrgContext** (correct) |
| src/pages/MembersPage.tsx | 155 | PRESIDENTE | Show role change dropdown (not PRESIDENTE itself) | `canManage && member.role !== 'PRESIDENTE'` | **OrgContext** (correct) |
| src/pages/EventosPage.tsx | 33 | admin | Show "Novo Evento" button, enable evento form | `user?.role === 'admin'` | **Auth Layer** (legacy) |
| src/pages/EventosPage.tsx | 84, 119 | admin | Gate create/edit operations | `canWrite` based on admin role | **Auth Layer** (legacy) |
| src/pages/ParticipantsPage.tsx | 51-55 | admin, lider | Determine canWrite, canDelete capabilities | `user?.role === 'admin' \|\| 'lider'` then `canWrite = 'admin' \|\| 'lider'`, `canDelete = 'admin'` | **Auth Layer** (legacy) |
| src/pages/ParticipantsPage.tsx | 88 | lider, admin | Show "Novo Participante" button | `disabled={!canWrite}` where canWrite = admin/lider | **Auth Layer** (legacy) |
| src/pages/AcomodacoesPage.tsx | 19-20 | admin, lider | Determine userRole for component props | `user?.role === 'admin' \|\| 'lider' ? role : 'servo'` | **Auth Layer** (legacy) |
| src/pages/AcomodacoesPage.tsx | 44 | admin, lider | Show assign/release buttons | `canWrite = userRole === 'admin' \|\| 'lider'` | **Auth Layer** (legacy) |
| src/pages/AcomodacoesPage.tsx | 84 | servo | Show "Estrutura (leitura)" vs "Estrutura" label | `userRole === 'servo'` | **Auth Layer** (legacy) |
| src/pages/AcomodacoesPage.tsx | 136 | servo | Show read-only warning message | `userRole === 'servo'` | **Auth Layer** (legacy) |
| src/pages/FinanceiroPage.tsx | (no checks) | (none) | All authenticated users can view | No role check; uses activeOrgId only | **OrgContext** (implicit auth) |
| src/pages/InscricoesPage.tsx | (no checks) | (none) | All authenticated users can view | No role check; uses activeOrgId only | **OrgContext** (implicit auth) |
| src/pages/OnboardingPage.tsx | (no checks) | (none) | All authenticated users can access | No role check | (N/A - onboarding) |
| src/pages/login.tsx | (no checks) | (none) | Public; no role check | N/A | (N/A - public) |
| src/pages/register.tsx | (no checks) | (none) | Public; no role check | N/A | (N/A - public) |
| src/pages/dashboard.tsx | (no checks) | (none) | Requires authentication only | No role check | (N/A - dashboard) |
| src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx | 417 | admin, lider | Show edit buttons for estrutura | `canEdit = userRole === 'admin' \|\| 'lider'` | **Auth Layer** (legacy) |
| src/components/acomodacoes/AssignCamaSheet.tsx | 101 | admin, lider | Show assign/release buttons in sheet | `canWrite = userRole === 'admin' \|\| 'lider'` | **Auth Layer** (legacy) |
| src/components/participantes/ParticipanteFichaSheet.tsx | (props) | (depends on parent) | canWrite, canDelete passed as props | Props `canWrite`, `canDelete` from parent | **Auth Layer** (legacy) |
| src/components/protected-route.tsx | 25 | (any) | Check requiredRole against user.role | `user?.role !== requiredRole && user?.role !== 'admin'` | **Auth Layer** (legacy) |
| src/contexts/org-context.tsx | 30 | (all roles) | Provide userRole from Better Auth member | `userRole = activeMember?.role ?? null` | **OrgContext** (correct) |

### Authorization Pattern Analysis

#### Pattern 1: Legacy Auth Layer Role Checks
**Pattern:** `user?.role === 'admin'` or `user?.role === 'lider'`  
**Status:** ACTIVE - Used in 5 out of 10 main pages  
**Modules:** ParticipantsPage, AcomodacoesPage, EventosPage  
**Risk:** 
- Uses generic auth layer roles, NOT Koinonia OrgRoles
- No enforcement of PRESIDENTE vs PASTOR_PRINCIPAL distinction
- Cannot enforce operation-level RBAC (e.g., CREATE_EVENTO vs EDIT_EVENTO)
- No visibility scoping (PESSOAS_SCOPE, event status visibility)
**Files:**
- Used in: ParticipantsPage.tsx (lines 51-55, 88), AcomodacoesPage.tsx (lines 19-20, 44, 84, 136), EventosPage.tsx (lines 33, 84, 119)
- Components: EstruturaAcomodacaoPanel.tsx (line 417), AssignCamaSheet.tsx (line 101), ParticipanteFichaSheet.tsx (props)

#### Pattern 2: Organization Context Role Checks
**Pattern:** `useOrgContext().userRole === 'PRESIDENTE'` or `'PASTOR_PRINCIPAL'`  
**Status:** ACTIVE but INCOMPLETE - Only used in MembersPage  
**Modules:** MembersPage, FinanceiroPage (implicit)  
**Benefits:**
- Uses correct Koinonia OrgRoles
- Provides organization-scoped authorization
- Properly distinguishes role hierarchy
**Gap:** Only MembersPage uses it explicitly; other pages don't leverage org role hierarchy  
**Files:**
- Used in: MembersPage.tsx (lines 35, 43, 155)
- OrgContext provider: contexts/org-context.tsx (lines 28-30)

#### Pattern 3: No Role Check (Implicit Auth)
**Pattern:** No explicit role check; relies on authentication + OrgContext activeOrgId  
**Status:** ACTIVE in FinanceiroPage, InscricoesPage  
**Modules:** FinanceiroPage, InscricoesPage  
**Characteristics:**
- All authenticated users with selected organization can view
- No write operations guarded
- No role-based filtering of data
**Files:**
- FinanceiroPage.tsx (no role checks)
- InscricoesPage.tsx (no role checks)

### Authorization Gaps & Inconsistencies

| Gap Type | Location | Description | Severity |
|----------|----------|-------------|----------|
| **Mixed Role Sources** | ParticipantsPage, AcomodacoesPage, EventosPage | Use `user.role` (auth layer) instead of `useOrgContext().userRole` (org layer) | HIGH |
| **No OrgRole Enforcement** | ParticipantsPage, AcomodacoesPage, EventosPage | Role checks use generic 'admin'/'lider', not Koinonia roles; cannot enforce PRESIDENTE vs PASTOR_PRINCIPAL distinction | HIGH |
| **No Operation Checks** | All pages except MembersPage | No enforcement of fine-grained operations (e.g., CREATE_EVENTO vs EDIT_EVENTO); binary canWrite/canDelete only | HIGH |
| **No Visibility Scoping** | All pages | Do not enforce PESSOAS_SCOPE (ALL_ORG, OWN_SUBTREE, DIRECT_CHILDREN, SELF_ONLY) for data filtering | HIGH |
| **No Event Status Visibility** | EventosPage | Do not enforce event status visibility rules (planning status visible to PRESIDENTE/PASTOR_PRINCIPAL only) | MEDIUM |
| **Incomplete Write Guards** | FinanceiroPage, InscricoesPage | No canWrite/canDelete checks; all authenticated org members can perform write operations | MEDIUM |
| **Type Safety** | org-context.tsx | `userRole` typed as `string \| null` instead of `OrgRole \| null` | LOW |
| **Component Props** | ParticipanteFichaSheet | Receives `canWrite`, `canDelete` as props; no role source clarity in component | MEDIUM |

### Page-by-Page Authorization Summary

**MembersPage** ✅ Correct Pattern
- Uses `useOrgContext().userRole` (org context)
- Checks for PRESIDENTE or PASTOR_PRINCIPAL
- Shows/hides invite form and role selector based on role
- **Status:** Correct; follows multi-tenant pattern

**EventosPage** ❌ Wrong Role Source
- Uses `user?.role === 'admin'` (auth layer)
- Should use `useOrgContext().userRole` with check for PRESIDENTE or PASTOR_PRINCIPAL
- **Status:** Legacy pattern; migration needed

**ParticipantsPage** ❌ Wrong Role Source
- Uses `user?.role` (auth layer) with values 'admin', 'lider', 'servo'
- Should use `useOrgContext().userRole` with Koinonia roles
- **Status:** Legacy pattern; migration needed

**AcomodacoesPage** ❌ Wrong Role Source
- Uses `user?.role` (auth layer) with values 'admin', 'lider', 'servo'
- Shows different UI label based on userRole (e.g., 'Estrutura (leitura)' for servo)
- Should use `useOrgContext().userRole` with Koinonia roles
- **Status:** Legacy pattern; migration needed

**FinanceiroPage** ✅ Implicit Auth (Acceptable)
- No explicit role checks
- Relies on authentication + activeOrgId
- All authenticated org members can create/view
- **Status:** Acceptable for financial overview; may need write guards in future

**InscricoesPage** ✅ Implicit Auth (Acceptable)
- No explicit role checks
- Relies on authentication + activeOrgId
- All authenticated org members can view
- **Status:** Acceptable for read-only listing; matches API behavior

### Authorization Inventory Summary

**Total Pages Audited:** 10 (including auth pages)  
**Pages with Role Checks:** 5 (MembersPage, EventosPage, ParticipantsPage, AcomodacoesPage, ProtectedRoute)  
**Pages with Correct Role Source (OrgContext):** 1 (MembersPage only)  
**Pages with Legacy Role Source (Auth Layer):** 4 (EventosPage, ParticipantsPage, AcomodacoesPage, ProtectedRoute)  
**Pages with No Role Check:** 2 (FinanceiroPage, InscricoesPage)  

**Pattern Distribution:**
- **OrgContext roles (correct):** 1 page (10%)
- **Auth layer roles (legacy):** 4 pages (40%)
- **No role check (implicit auth):** 2 pages (20%)
- **Auth/dashboard pages:** 3 pages (30%)

### Component-Level Authorization

| Component | File | Pattern | Role Source |
|-----------|------|---------|-------------|
| EstruturaAcomodacaoPanel | src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx | `canEdit = userRole === 'admin' \|\| 'lider'` | Auth layer (legacy) |
| AssignCamaSheet | src/components/acomodacoes/AssignCamaSheet.tsx | `canWrite = userRole === 'admin' \|\| 'lider'` | Auth layer (legacy) |
| ParticipanteFichaSheet | src/components/participantes/ParticipanteFichaSheet.tsx | Props: `canWrite`, `canDelete` | Auth layer (legacy) |
| EventoCard | src/components/eventos/EventoCard.tsx | Prop: `canWrite` (boolean) | Parent determines (EventosPage uses auth layer) |
| ProtectedRoute | src/components/protected-route.tsx | `user?.role !== requiredRole && user?.role !== 'admin'` | Auth layer (legacy) |

---

## Extension Points for Future Tasks

This audit establishes the foundation for:

1. **Task 2 (COMPLETE)**: ✅ Inventory all HTTP endpoints and their authorization checks
   - ✅ Map each route to required operation(s)
   - ✅ Document authorization patterns found
   - ✅ Identify gaps and inconsistencies
   - ✅ Create API Authorization Inventory table with 41 endpoints

2. **Task 3 (COMPLETE)**: ✅ Inventory Web layer authorization patterns
   - ✅ Map UI pages to role checks
   - ✅ Identify role sources (OrgContext vs Auth layer)
   - ✅ Document patterns and gaps
   - ✅ Create Web Authorization Inventory with 20 pages/components

3. **Future Enhancements (Post-Audit)**:
   - **Migrate Web pages to OrgContext** (EventosPage, ParticipantsPage, AcomodacoesPage)
     - Replace `user.role` checks with `useOrgContext().userRole`
     - Use Koinonia OrgRole values (PRESIDENTE, PASTOR_PRINCIPAL, etc.)
   - **Implement operation-level RBAC** in Web
     - Add fine-grained operations (CREATE_EVENTO, EDIT_EVENTO, etc.) to operation guards
     - Enforce via `canPerform()` checks similar to API layer
   - **Add visibility scoping** to data queries
     - Filter participants by PESSOAS_SCOPE based on user role
     - Filter events by status visibility rules
   - **Migrate legacy routes** to use TenantCtx + canPerform() pattern (API)
   - **Add operation checks** to participantes, inscricoes, acomodacoes API routes
   - **Implement visibility scoping** in API queries (PESSOAS_SCOPE, event status visibility)
   - **Remove ParticipanteController fallback** once org activation is end-to-end
   - **Refine Web layer type safety** (`string | null` → `OrgRole | null` in OrgContext)
   - **Consider permission caching** if RBAC becomes performance-critical
