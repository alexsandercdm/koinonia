# Phase 05: Fase 0 Frontend - Revisao do Projeto e Mapeamento de Tarefas do Roadmap - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 05-fase-0-frontend-revis-o-do-projeto-e-mapeamento-de-tarefas-do-roadmap
**Mode:** auto (execute-mode fallback)
**Areas discussed:** escopo da fase, baseline tecnica frontend, mapeamento por fase, priorizacao de execucao

---

## Escopo da fase

| Option | Description | Selected |
|--------|-------------|----------|
| Descoberta e planejamento | Inventariar front atual, mapear entregas por fase e preparar planejamento | ✓ |
| Implementacao imediata de telas | Comecar codificacao sem mapeamento completo por fase | |
| Revisao documental apenas | Atualizar documentos sem analisar codigo web | |

**User's choice:** Descoberta e planejamento (via solicitacao direta de adicionar fase 0 + discuss-phase para revisar front e mapear roadmap)
**Notes:** Escopo mantido sem adicionar nova capacidade de produto.

---

## Baseline tecnica frontend

| Option | Description | Selected |
|--------|-------------|----------|
| Runtime-first | Tratar codigo como fonte canonica para auth e fluxo protegido | ✓ |
| Document-first | Tratar koinonia-doc-tec como fonte primaria mesmo com conflito | |
| Mixed sem reconciliacao | Misturar referencias sem resolver divergencias | |

**User's choice:** Runtime-first
**Notes:** Divergencias legadas de Supabase Auth no documento foram explicitamente marcadas como stale frente ao Better Auth implementado.

---

## Mapeamento de tarefas por fase

| Option | Description | Selected |
|--------|-------------|----------|
| Mapear fase 1..4 | Distribuir entregas frontend por fase do roadmap atual | ✓ |
| Mapear apenas fase atual | Limitar ao modulo imediatamente em trabalho | |
| Reordenar roadmap | Mudar dependencias/fases do roadmap existente | |

**User's choice:** Mapear fase 1..4
**Notes:** Mapeamento definido para AUTH/PES (F1), INS (F2), ACO (F3), FIN/ADM (F4).

---

## Priorizacao de execucao

| Option | Description | Selected |
|--------|-------------|----------|
| Fluxo E2E com backend pronto | Priorizar telas que fecham jornada operacional completa | ✓ |
| Priorizacao visual | Priorizar apenas polish visual e UX antes de fluxos | |
| Paralelizar tudo | Iniciar todos os modulos de UI ao mesmo tempo | |

**User's choice:** Fluxo E2E com backend pronto
**Notes:** Ordem consolidada: participantes -> inscricoes/eventos -> financeiro/admin; acomodacoes ja em estado avancado.

---

## Codex Notes

- Contexto gerado sem AskUserQuestion interativo por estar em execute mode (fallback auto).
- Nenhum todo foi foldado (todo match-phase retornou 0 itens para phase 5).
- Nenhuma nova capacidade fora de escopo foi adicionada.
