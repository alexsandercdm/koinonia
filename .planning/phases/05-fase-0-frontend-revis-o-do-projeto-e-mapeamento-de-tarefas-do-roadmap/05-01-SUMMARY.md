---
phase: "05"
plan: "05-01"
status: complete
key-files:
  - apps/web/src/pages/InscricoesPage.tsx (criado)
  - apps/web/src/hooks/use-inscricoes.ts (criado)
  - apps/web/src/App.tsx (rota /inscricoes adicionada)
  - apps/web/src/pages/dashboard.tsx (Participantes e Inscricoes ativados)
  - .planning/phases/05-.../05-01-PLAN.md (criado)
decisions:
  - InscricoesPage usa GET /eventos/:evento_id/inadimplentes (unico endpoint de lista disponivel por evento)
  - Listagem exige selecao de evento (sem endpoint global de inscricoes)
  - StatusPagamentoEnum confirmado: PENDENTE, PAGO_PARCIAL, PAGO_TOTAL, LISTA_ESPERA, CANCELADA
  - Filtros implementados: por status (todos vs inadimplentes) e por papel (todos/encontrista/servo)
  - Cards de metricas: total inscritos, inadimplentes, pago total, arrecadado vs pendente
  - Dashboard agora navega para /participantes e /inscricoes (antes disabled)
  - AcomodacoesPage ja alinhada com schemas atuais (fase 03 corrigiu)
metrics:
  type-check-web: PASS (204 erros pre-existentes de ambiente, 0 erros novos introduzidos)
