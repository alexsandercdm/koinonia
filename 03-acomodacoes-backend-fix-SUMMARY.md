---
phase: "03"
plan: "03-acomodacoes-backend-fix"
tags: [backend, acomodacoes, bugfix, schemas, uat]
key-files:
  - packages/shared/src/index.ts
  - apps/api/src/modules/acomodacoes/repositories/AcomodacaoRepository.ts
  - apps/api/src/modules/acomodacoes/controllers/AcomodacaoStructureController.ts
  - apps/api/src/modules/acomodacoes/controllers/AcomodacaoOperationsController.ts
  - apps/api/src/modules/acomodacoes/usecases/ListLocaisEstruturaUseCase.ts
decisions:
  - "StatusPagamentoEnum migrado de lowercase para UPPERCASE para alinhar com valores do DB"
  - "EventoSchema removidos campos valor_inscricao_encontrista/servo pois no DB ficam em configuracaoEvento"
  - "InscricaoSchema adicionado campo status que existia no DB mas faltava no schema"
  - "CamaSchema.bloqueada agora tem .default(false) alinhado ao DB notNull().default(false)"
  - "updateCama manteve sem updated_at pois a tabela camas nao possui essa coluna no DB"
  - "lockCama alterado de INNER JOIN para LEFT JOIN para suportar camas orfas"
  - "Guard adicionado em assignCama para evitar parse de request.body undefined"
metrics:
  type-check-shared: "PASS"
  type-check-api: "PASS"
  build-shared: "PASS"
  commits: 3
---

# Backend Fix Summary — Fase 03 Acomodações

## Problema Original

UAT Test #2 BLOCKED com erro: **"Cannot read properties of undefined (reading 'parse')"** ao fazer POST de acomodações como admin/lider.

## Causa Raiz Identificada

O erro tinha múltiplas causas contribuintes:

1. **`AcomodacaoOperationsController.assignCama`** chamava `AssignCamaDTO.parse(request.body)` sem verificar se `request.body` existia — quando o client enviava body malformado ou vazio, o parse falhava
2. **`AcomodacaoOperationsController`** não importava `AcomodacaoError` (import faltante), o que impediria o throw correto do guard
3. **Schemas inconsistentes** entre `packages/shared` e `apps/api/src/db/schema.ts` causavam falhas silenciosas em validações downstream

## Correções Aplicadas

### 1. Schemas (`packages/shared/src/index.ts`)

| Schema | Campo | Antes | Depois | Motivo |
|--------|-------|-------|--------|--------|
| `StatusPagamentoEnum` | valores | `'pendente', 'pago_parcial', 'pago_total'` | `'PENDENTE', 'PAGO_PARCIAL', 'PAGO_TOTAL', 'LISTA_ESPERA', 'CANCELADA'` | DB usa UPPERCASE |
| `CamaSchema` | `bloqueada` | `.optional()` | `.optional().default(false)` | DB: `.notNull().default(false)` |
| `InscricaoSchema` | `status` | **ausente** | `StatusPagamentoEnum` | DB tem coluna status com default 'PENDENTE' |
| `EventoSchema` | `valor_inscricao_encontrista`, `valor_inscricao_servo` | presentes | **removidos** | No DB ficam na tabela `configuracaoEvento` |
| `EventoSchema` | `local_id` | `.uuid()` required | `.uuid().optional()` | DB: `.references()` sem notNull |
| `CreateInscricaoDTO` | `status` | required | `.optional()` | DB tem default, create não precisa enviar |

### 2. Repository (`AcomodacaoRepository.ts`)

- **`lockCama`**: INNER JOIN → LEFT JOIN (suporte a camas órfãs)
- **`listQuartosByLocalId(localId)`**: novo método para consulta direta
- **`listCamasByQuartoId(quartoId)`**: novo método para consulta direta
- **`updateCama`**: mantido sem `updated_at` (tabela `camas` não possui essa coluna)

### 3. Controller + Use Case

- **Criado** `ListLocaisEstruturaUseCase` seguindo padrão dos use cases existentes
- **`AcomodacaoStructureController`**: agora usa `ListLocaisEstruturaUseCase` em vez de chamar repository direto
- **`AcomodacaoStructureController`**: removidos imports não usados de DTOs
- **`AcomodacaoOperationsController.assignCama`**: adicionado guard `if (!request.body || typeof request.body !== 'object')` antes do `.parse()`
- **`AcomodacaoOperationsController`**: adicionado import faltante de `AcomodacaoError`

## Commits

| Commit | Hash | Descrição |
|--------|------|-----------|
| 1 | `99b785d` | fix(03-acomodacoes): corrigir schemas inconsistentes entre shared e DB |
| 2 | `de5c286` | fix(03-acomodacoes): corrigir repository lockCama e adicionar queries de performance |
| 3 | `cb16138` | fix(03-acomodacoes): corrigir controllers e criar ListLocaisEstruturaUseCase |

## Verificação

- ✅ `pnpm --filter @koinonia/shared type-check` — PASS
- ✅ `pnpm --filter @koinonia/api type-check` — PASS
- ✅ `pnpm --filter @koinonia/shared build` — PASS

## Stubs / Pendências

- Nenhuma. Todas as correções do escopo foram implementadas.

## Threat Flags

- Nenhuma superfície de segurança nova exposta. As mudanças são aditivas e corretivas.
