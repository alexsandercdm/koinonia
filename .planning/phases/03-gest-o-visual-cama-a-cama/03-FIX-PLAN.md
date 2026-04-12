# Fase 03: Plano de Correção de Bugs

**Fase:** 03-gest-o-visual-cama-a-cama
**Origem:** Code review + UAT test #2 falhou com "Cannot read properties of undefined (reading 'parse')"
**Data:** 2026-04-12

---

## Problema Principal

O UAT Test #2 (CRUD estrutural de acomodações) está **bloqueado**. POSTs de locais/quartos/camas falham com:
```
Cannot read properties of undefined (reading 'parse')
```

Isso invalida toda a cadeia subsequente: mapa de acomodação, atribuição de camas, e fluxos frontend.

---

## Bugs a Corrigir

### BACKEND — Grupo A: Parse e Use Cases (CRÍTICO)

| # | Bug | Arquivo | Fix |
|---|-----|---------|-----|
| A-01 | `AssignCamaDTO.parse()` espera `inscricao_id` (snake_case) mas frontend envia camelCase | `AcomodacaoOperationsController.ts:40` | Normalizar parse para aceitar ambas as formas |
| A-02 | `CamaSchema.bloqueada` sem `.default(false)` — parse falha quando undefined | `packages/shared/src/index.ts:59` | Adicionar `.default(false)` |
| A-03 | `listLocaisWithStructure` chamado direto do controller sem use case — viola arquitetura | `AcomodacaoStructureController.ts` | Criar `ListLocaisEstruturaUseCase` |
| A-04 | `InscricaoSchema` sem campo `status` — inconsistência com DB | `packages/shared/src/index.ts:78-90` | Adicionar `status` com `StatusInscricaoEnum` |
| A-05 | `StatusPagamentoEnum` lowercase vs DB UPPERCASE | `packages/shared/src/index.ts:8` | Mudar para UPPERCASE ou adicionar mapping |
| A-06 | `EventoSchema` tem campos que não existem no DB (`valor_inscricao_encontrista`) | `packages/shared/src/index.ts:66-77` | Remover campos inexistentes ou mapear |
| A-07 | `updateCama` não seta `updated_at` | `AcomodacaoRepository.ts:44-49` | Adicionar `updated_at: new Date()` |
| A-08 | `INNER JOIN` em `lockCama` mascara camas órfãs | `AcomodacaoRepository.ts:146` | Mudar para `LEFT JOIN` ou validar no use case |

### BACKEND — Grupo B: Performance (HIGH)

| # | Bug | Arquivo | Fix |
|---|-----|---------|-----|
| B-01 | `listQuartosByLocal` e `listCamasByQuarto` fazem scan O(N) completo | `AcomodacaoStructureController.ts:34-55` | Criar queries diretas `listQuartosByLocalId()` e `listCamasByQuartoId()` |

### FRONTEND — Grupo C: Hooks e API (CRÍTICO)

| # | Bug | Arquivo | Fix |
|---|-----|---------|-----|
| C-01 | `getAuthHeaders()` retorna só Content-Type quando sessão falha — requests procedem sem auth | `apps/web/src/lib/api.ts:5-13` | Lançar erro ou redirect para /login |
| C-02 | `useliberarCama` com lowercase 'l' — viola convenção React | `use-acomodacoes.ts:248` | Renomear para `useLiberarCama` |
| C-03 | `useLiberarCama` envia DELETE para URL errada (`/atribuir` vs `/atribuicao`) | `use-acomodacoes.ts:252-253` | Corrigir URL para endpoint correto |
| C-04 | `EstruturaAcomodacaoPanel` busca camas mas não renderiza a lista | `EstruturaAcomodacaoPanel.tsx:535-538` | Adicionar renderização da lista de camas |
| C-05 | `useInscricoesSemCama` dispara mesmo com sheet fechada | `AssignCamaSheet.tsx:60-63` | Adicionar `enabled: open && isDisponivel` |
| C-06 | `parseInt` sem `isNaN` guard — envia NaN para API | `EstruturaAcomodacaoPanel.tsx:45,124` | Adicionar guard `!isNaN(parsed)` |
| C-07 | PDF export — imagens multi-page são clipped | `exportMapaAcomodacao.ts:118-125` | Slicing vertical do canvas por página |

---

## Ordem de Execução

1. **Grupo A (Backend Crítico)** — Primeiro, pois sem isso nenhum endpoint funciona
2. **Grupo C (Frontend Crítico)** — Segundo, pois depende dos endpoints do Grupo A funcionando
3. **Grupo B (Backend Performance)** — Terceiro, otimização
4. **Grupo C restante (Frontend Qualidade)** — Quarto, polish

---

## Agentes

- **Agente Backend**: Grupos A + B
- **Agente Frontend**: Grupo C

---

## Verificação Final

- [ ] `pnpm --filter @koinonia/api type-check`
- [ ] `pnpm --filter @koinonia/web type-check`
- [ ] `pnpm --filter @koinonia/api build`
- [ ] `pnpm --filter @koinonia/web build`
- [ ] UAT Test #2 passa (CRUD estrutural)
- [ ] UAT Test #3 passa (Mapa por evento)
- [ ] UAT Test #4 passa (Atribuição transacional)
- [ ] UAT Test #5 passa (Liberação de cama)
