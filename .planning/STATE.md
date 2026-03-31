# STATE

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-03-31)

**Core value:** Gestão de participantes e alocação de quartos com regras estritas de gênero.
**Current focus:** Phase 1: Core Foundation & Pessoas

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
