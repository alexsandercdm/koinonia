---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-31T04:35:58.649Z"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 4
  completed_plans: 4
---

# STATE

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-03-31)

**Core value:** Gestão de participantes e alocação de quartos com regras estritas de gênero.
**Current focus:** Phase 02 — core-business-inscricoes-eventos

## Developer Preferences

- **Modo GSD**: YOLO (Automático)
- **Granularidade**: Coarse (Fases maiores)
- **Execução**: Paralela
- **Git Tracking**: Ativado (docs no git)
- **Qualidade/Agentes**: Pesquisa, Plan Checker, Verificador habilitados.
- **Workflow Mandatório**: Empregar e usar sempre as diretrizes da skill `tlc-spec-driven` (Specify, Design, Tasks, Execute) em todas as fases para gerar especificações e testes exatos antes da codificação. 

## Decisions Log

- **Banco de Dados/ORM**: PostgreSQL com Drizzle ORM (Modular Monolith)
- **Autenticação**: Better Auth selecionado sobre Supabase Auth.
