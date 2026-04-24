---
phase: "03"
plan: acomodacoes
tags:
  - frontend-fixes
  - acomodacoes
  - bug-fix
key-files:
  - apps/web/src/lib/api.ts
  - apps/web/src/hooks/use-acomodacoes.ts
  - apps/web/src/components/acomodacoes/EstruturaAcomodacaoPanel.tsx
  - apps/web/src/components/acomodacoes/ExportMapaPdfButton.tsx
  - apps/web/src/components/acomodacoes/MapaQuartosGrid.tsx
  - apps/web/src/lib/pdf/exportMapaAcomodacao.ts
  - apps/web/src/pages/dashboard.tsx
  - packages/shared/tsconfig.json
decisions:
  - "C-01: getAuthHeaders já lançava erro — adicionado handler 401 extra no apiFetch como camada adicional"
  - "C-02: useLiberarCama já estava com nome correto — nenhum change needed"
  - "C-03: URL corrigida de /atribuicao para /atribuir (conforme backend)"
  - "C-04: Lista de camas já era renderizada — nenhum change needed"
  - "C-05: enabled já era passado corretamente — nenhum change needed"
  - "C-06: isNaN guard adicionado em LocalForm e QuartoForm"
  - "C-07: PDF slicing já estava implementado — corrigidos tipos MapaAcomodacaoResponse -> MapaAcomodacao"
  - "C-08: Botões do dashboard com disabled + tooltip 'Em breve', exceto Acomodações que navega"
metrics:
  errors-before: 22
  errors-after: 9
  errors-fixed: 13
  commits: 6
---

# Summary: Phase 03 — Frontend Bug Fixes (Acomodações)

## Bugs Corrigidos

| Bug | Status | Descrição |
|-----|--------|-----------|
| C-01 | ✅ Corrigido | Handler 401 adicionado no apiFetch como proteção adicional |
| C-02 | ✅ Já OK | `useLiberarCama` já seguia convenção |
| C-03 | ✅ Corrigido | URL de `/atribuicao` → `/atribuir` (match backend) |
| C-04 | ✅ Já OK | Lista de camas já renderizada no EstruturaAcomodacaoPanel |
| C-05 | ✅ Já OK | `enabled` já controlado via `open && isDisponivel` |
| C-06 | ✅ Corrigido | `parseInt` com `isNaN` guard em LocalForm e QuartoForm |
| C-07 | ✅ Corrigido | Tipos corrigidos (MapaAcomodacaoResponse → MapaAcomodacao), slicing já funcionava |
| C-08 | ✅ Corrigido | Botões do dashboard com `disabled` + `title="Em breve"` ou navegação |

## Commits

1. `fix(03-acomodacoes): add auth guard and 401 handler in apiFetch`
2. `fix(03-acomodacoes): correct DELETE endpoint URL for cama release`
3. `fix(03-acomodacoes): add isNaN guards for parseInt in forms`
4. `fix(03-acomodacoes): add disabled state and navigation to dashboard buttons`
5. `fix(03-acomodacoes): fix type errors in PDF export and map grid`
6. `chore(03-acomodacoes): fix shared tsconfig and clean stale generated files`

## Erros Pré-existentes (não corrigidos — fora do escopo)

- `auth-context.tsx:22` — Tipo de retorno do login incompatível (Better Auth type mismatch)
- `use-acomodacoes.ts:178,189,277,288` — Parâmetros `localId`/`quartoId` declarados mas não usados em onSuccess
- `api.ts:3` / `auth.ts:4` — `import.meta.env` sem types do Vite
- `login.tsx:1` / `register.tsx:1` — Import `React` não usado

## Known Stubs

Nenhum stub introduzido.

## Threat Flags

- **Auth bypass protection**: `getAuthHeaders()` agora lança `Unauthenticated` se token ausente, prevenindo requests sem auth.
- **401 redirect**: `apiFetch` detecta 401 e redireciona para `/login`, prevenindo loops de requisições falhas.

## Deviations

Nenhuma deviation significativa. Todas as correções seguiram o plano original.
