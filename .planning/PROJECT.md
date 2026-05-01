# Koinonia

## What This Is

Sistema open-source de gestão para retiros espirituais, projetado para igrejas e ministérios. O produto gerencia pessoas, inscrições, pagamentos, mapa visual de acomodações (cama-a-cama) e dashboards financeiros. A interface é mobile-first e a aplicação pode ser auto-hospedada com baixo custo.

## Core Value

Gestão de participantes e alocação de quartos com regras estritas de gênero e capacidade de forma eficiente, para que os organizadores focar no aspecto espiritual sem falhas burocráticas ou desorganização de infraestrutura.

## Current Milestone: v1.1 Frontend Funcional & Primeiro Deploy

**Goal:** Conectar o frontend ao backend com CRUD completo nas telas de Participantes, Eventos, Inscrições e Acomodações, e preparar o sistema para o primeiro teste com usuários reais.

**Target features:**
- CRUD de Participantes (formulário completo: saúde, contato de emergência, histórico)
- Cadastro e gestão de Eventos (criar, editar, listar com período, local, capacidade)
- Fluxo de Inscrições (inscrever participante em evento, registrar pagamentos, status automático)
- Cadastro de Locais, Quartos e Camas (estrutura de acomodação com regras de gênero)
- Mapa visual de acomodação com atribuição cama-a-cama
- Infraestrutura de deploy (ambiente de teste para validação com usuários)

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->
- ✓ Autenticação Migrada para Better Auth (PostgreSQL, Middleware, Fastify).
- ✓ Estrutura de Monorepo com Turborepo (apps/api, apps/web, packages/shared).
- ✓ Setup de banco de dados e migrações (Supabase Local/PG, Drizzle ORM).
- ✓ Validações full-stack centralizadas (Zod).

### Active

<!-- Current scope. Building toward these. -->
- [ ] CRUD completo de Participantes (Busca, Histórico e Saúde).
- [ ] Migração do frontend para o redesign `doc/Koinonia-redesign` antes dos CRUDs funcionais.
- [ ] Módulo Inscrições e Eventos (Registro, Role, Valor e Pagamento).
- [ ] Módulo Acomodação Cama-a-Cama (Locais, Quartos, Camas, Mapa Visual e Atribuição com lock otimista).
- [ ] Módulo Financeiro (Break-Even, Fluxo de Caixa, Despesas).
- [ ] Auditoria, Segurança (RLS e Logs) e Permissões.
- [ ] Testes de Integração e E2E robustos em todas as etapas de core business.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->
- Integração profunda com provedores de cloud proprietários pagos (vendor lock-in) — O sistema deve continuar barato e viável para auto-hospedagem (self-hosting via Coolify/Docker).
- Fases 2 (Check-in via QR code/App Nativo) e 3 (Crachás/Relatórios pós-encontro) — Mapeadas para o futuro (out of scope no MVP).

## Context

A aplicação foi migrada de Supabase Auth para BetterAuth recentemente.
O backend usa Node.js Fastify + TypeScript + Drizzle ORM e o frontend é React Vite + Tailwind + TanStack. Todo o projeto já conta com uma base bem estruturada com modular monolith.
A Stack está explicitada e definida no arquivo de documentação entregue.

## Constraints

- **Tech Stack**: Fastify + React Vite + Drizzle + Better Auth — Manter consistência tecnológica.
- **Acessibilidade & UI**: Mobile-first, alvos de toque >= 44px, DM Sans como fonte única do sistema.
- **Design System**: `doc/Koinonia-redesign` é o baseline visual atual (paleta "Hallowed Weight": fundo `#F7F4EF`, ouro `#C4923A`, texto `#1A1612`). Documentação em `doc/Design System Koinonia.html`. Designs antigos movidos para `doc/design_old/` como backup.
- **Offline Grace**: O TanStack Query deve reter cache por tempo estendido (connecção instável na chácara).
- **Fluxo de Trabalho**: Usar estritamente a skill `tlc-spec-driven` para Especificação, Design, Tarefas e Execução, como solitado.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Substituição Supabase Auth por Better Auth | Evitar bloqueios, reduzir custos operacionais com self-hosting e zerar dependências de serviços de autenticação externos. | ✓ Good |
| Alocação por lock Otimista (SELECT FOR UPDATE) | Previne "race condition" (duas pessoas atribuídas à mesma cama simultaneamente). | — Pending |
| Uso da metodologia tlc-spec-driven | Garante que o planejamento e a construção tenham especificação atômica e verificação (TDD implícito/Spec) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 — Milestone v1.1 started*
