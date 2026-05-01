---
status: fix_applied_pending_retest
phase: 7-participantes-crud-ui
source: [07-VERIFICATION.md]
started: 2026-04-26T21:47:02Z
updated: 2026-04-26T22:43:00Z
---

# Phase 7 Human UAT

## Current Test

[testing complete]

## Tests

### 1. Cached participant search
expected: Search for `Joao` or `João` filters existing list data immediately without changing the query key per keystroke.
result: retest_pending
reported: "Passou, parcialmente. Ao buscar por Joao sem o \"~\" na letra a, ele não retorna, mas ao buscar por joão ele retornar certinho."
severity: minor
fix: "07-04 added accent-insensitive normalization in ParticipantsPage local cached search."

### 2. Create participant
expected: A participant can be created through Dados / Saude / Emergencia and appears in the active list.
result: pass

### 3. Edit health data
expected: Editing `alergias` persists after page reload.
result: pass

### 4. View history
expected: Historico renders event name, role, status, and paid/total values when entries exist.
result: blocked
blocked_by: prior-phase
reason: "Não deu pra testar ainda, bloqueante devido a falta da opção de cadastrar o evento e vincular o participante, isso vai entrar nas próximas fases, adicione isso nas nossas anotações."

### 5. Soft-delete participant
expected: Desativar participante removes the participant from the active list and preserves inscription history.
result: blocked
blocked_by: prior-phase
reason: "Mesma situaçnao do teste 4"

## Summary

total: 5
passed: 2
issues: 0
pending: 1
skipped: 0
blocked: 2

## Gaps

- truth: "Search for `Joao` or `João` filters existing list data immediately without changing the query key per keystroke."
  status: fixed_pending_retest
  reason: "User reported: Passou, parcialmente. Ao buscar por Joao sem o \"~\" na letra a, ele não retorna, mas ao buscar por joão ele retornar certinho."
  severity: minor
  test: 1
  root_cause: "ParticipantsPage normalizes only case with toLowerCase(); it does not remove diacritics before comparing the search term with participant fields."
  artifacts:
    - path: "apps/web/src/pages/ParticipantsPage.tsx"
      issue: "Search comparison is accent-sensitive, so Joao does not match João."
  missing:
    - "Add a shared local normalizeSearchText helper using Unicode NFD plus diacritic removal before lowercasing."
    - "Use normalized values for search term and participant fields while keeping search client-side over cached data."
  debug_session: ""
  fix_plan: "07-04"
  fix_status: "applied_pending_retest"
