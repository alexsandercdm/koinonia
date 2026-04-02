---
status: complete
phase: 02-core-business-inscricoes
source: .planning/phases/02-core-business-inscricoes/02-01-inscricoes-schema-SUMMARY.md
started: 2026-04-01T20:22:25Z
updated: 2026-04-01T20:34:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Com a API parada e o banco de teste atualizado, iniciar a aplicação do zero deve subir sem erros de bootstrap ou migration pendente. Em seguida, o fluxo principal de inscrições deve responder sem falhas de schema, incluindo criação de evento, inscrição e pagamento inicial.
result: pass

### 2. Gerenciar Evento
expected: Um admin consegue atualizar um evento existente e substituir as configurações de preço por papel. Ao consultar o evento depois do update, os campos alterados e as novas configurações aparecem persistidos.
result: pass

### 3. Ciclo de Inscrição e Pagamento
expected: Um líder consegue registrar inscrição, aplicar pagamento parcial e total, substituir o participante por outro ainda não inscrito, cancelar a inscrição com estorno e consultar inadimplentes sem incluir cancelados ou lista de espera.
result: pass

### 4. Bloqueio de Duplicidade
expected: Ao tentar registrar a mesma pessoa duas vezes no mesmo evento, a API deve rejeitar a segunda inscrição e manter apenas um registro ativo para o par participante/evento.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
