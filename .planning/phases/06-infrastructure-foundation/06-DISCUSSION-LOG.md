# Phase 6: Infrastructure Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 06-infrastructure-foundation
**Areas discussed:** ApiError contract

---

## ApiError contract

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, erros por campo | ApiError.fieldErrors: Record<string, string> — validação inline sem submit extra | ✓ |
| Não, só status + message | ApiError.status + ApiError.message. Field errors viram responsabilidade do frontend com Zod client-side. | |

**User's choice:** Sim, erros por campo
**Notes:** Backend Fastify já retorna erros Zod estruturados — aproveitar para exibição inline nos formulários das phases 7–9.

---

| Option | Description | Selected |
|--------|-------------|----------|
| packages/shared | Compartilhado entre web e possíveis outros clients futuros | ✓ |
| apps/web/src/lib/api.ts | Só o frontend usa — colocalize com apiFetch | |

**User's choice:** packages/shared
**Notes:** Consistência com onde os Zod schemas já vivem.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Toast automático | onError global no QueryClient exibe toast com ApiError.message; mutations individuais podem sobrescrever | ✓ |
| Cada tela decide | onError sem handler global — cada hook/mutation define o que fazer | |

**User's choice:** Toast automático
**Notes:** Padrão global com override possível — mantém consistência com comportamento de toast das acomodações.

---

## Claude's Discretion

- Cache key versioning strategy (INFRA-02)
- Shape exata da resposta de GET /eventos/:id/inscricoes além dos campos mínimos (INFRA-03)
- Estratégia de coerção Zod para valor_total e StatusEventoEnum (INFRA-04)
- Ordem de execução das correções

## Deferred Ideas

- Cache persistence scope granular — Phase 10 se necessário
- Retry automático em mutations offline — Phase 10 (Offline Hardening)
