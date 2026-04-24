---
phase: "04"
plan: "04-01"
status: complete
key-files:
  - apps/api/src/db/schema.ts
  - apps/api/src/lib/audit.ts
  - apps/api/src/modules/admin/routes/admin.ts
  - apps/api/src/modules/admin/repositories/AuditLogRepository.ts
  - apps/api/src/modules/admin/usecases/ListAuditLogsUseCase.ts
  - apps/api/src/modules/admin/controllers/AuditLogController.ts
  - apps/api/src/modules/financeiro/routes/financeiro.ts
  - apps/api/src/modules/financeiro/repositories/FinanceiroRepository.ts
  - apps/api/src/modules/financeiro/usecases/GetMetricasUseCase.ts
  - apps/api/src/modules/financeiro/usecases/ListDespesasUseCase.ts
  - apps/api/src/modules/financeiro/usecases/CreateDespesaUseCase.ts
  - apps/api/src/modules/financeiro/controllers/FinanceiroController.ts
  - packages/shared/src/index.ts
decisions:
  - audit_logs e despesas já existiam no schema.ts — nenhuma migração necessária
  - auditLogs usa target_id (uuid -> pessoas) e changes (jsonb) em vez de resource/resource_id genérico
  - logAction helper é não-fatal: falha de auditoria não quebra a operação de negócio
  - metricas calculadas em runtime via JOIN entre pagamentos/inscricoes/despesas
  - breakEvenPct = (totalArrecadado / totalDespesas) * 100, cap 100%
  - AuditLogSchema em shared usa a estrutura real da tabela existente
metrics:
  type-check-api: PASS
  type-check-web: PASS
commits: 1
---

# Phase 04 - Summary

## O que foi implementado

### ADM-01 — Audit Log
- `lib/audit.ts`: helper `logAction(fastify, params)` não-fatal
- `modules/admin/repositories/AuditLogRepository.ts`: insert + listPaginated com filtros action/userId
- `modules/admin/usecases/ListAuditLogsUseCase.ts`
- `modules/admin/controllers/AuditLogController.ts`
- `modules/admin/routes/admin.ts`: `GET /api/v1/admin/audit-logs` (query: page, limit, action, userId) — role admin

### FIN-01 a FIN-04 — Métricas Financeiras
- `modules/financeiro/repositories/FinanceiroRepository.ts`: getMetricas (totalArrecadado, totalPrevisto, totalDespesas, breakEvenPct, porStatus), listDespesas, createDespesa
- `modules/financeiro/usecases/`: GetMetricasUseCase, ListDespesasUseCase, CreateDespesaUseCase
- `modules/financeiro/controllers/FinanceiroController.ts`
- `modules/financeiro/routes/financeiro.ts`:
  - `GET /api/v1/financeiro/metricas` (query: eventoId?) — role auth
  - `GET /api/v1/financeiro/despesas` (query: eventoId?) — role auth
  - `POST /api/v1/financeiro/despesas` — role lider

### Tipos shared
- `AuditLogSchema` — espelha colunas reais da tabela audit_logs
- `FinanceiroMetricasSchema` — totalArrecadado, totalPrevisto, totalDespesas, breakEvenPct, porStatus
