# Phase 05: Fase 0 Frontend - Revisao do Projeto e Mapeamento de Tarefas do Roadmap - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Consolidar uma baseline de frontend para o MVP: revisar o estado real de `apps/web`, reconciliar divergencias da documentacao tecnica com a implementacao atual (especialmente autenticacao), e mapear quais entregas de interface entram em cada fase do roadmap (1 a 4) antes de novas implementacoes.

Esta fase nao entrega novo modulo de negocio; ela define o plano de execucao do frontend com rastreabilidade por fase para evitar retrabalho e regressao.

</domain>

<decisions>
## Implementation Decisions

### Escopo da fase 05
- **D-01:** `[auto]` A fase 05 sera de descoberta e planejamento do frontend (inventario, mapeamento e criterios), sem expandir escopo funcional do produto.
- **D-02:** `[auto]` O codigo em runtime e a fonte canonica para autenticacao/fluxo protegido; mencoes legadas de Supabase Auth na documentacao devem ser tratadas como stale.

### Baseline tecnica do frontend
- **D-03:** `[auto]` Manter React 18 + Vite + TanStack Query + Tailwind + Better Auth client como stack oficial de frontend.
- **D-04:** `[auto]` Reaproveitar os componentes existentes (`components/ui/*`, `components/acomodacoes/*`) e evitar novos patterns antes de fechar lacunas dos modulos MVP.

### Mapeamento de tarefas frontend por fase do roadmap
- **D-05:** `[auto]` **Phase 1 (AUTH + PES):** concentrar frontend em login/register/sessao protegida, dashboard navegavel e modulo completo de participantes (lista, cadastro, edicao, historico, soft-delete).
- **D-06:** `[auto]` **Phase 2 (INS):** implementar frontend de eventos/inscricoes/pagamentos (listagens, formularios, filtros por status/papel, tela de inadimplentes e fluxo de cancelamento com estorno).
- **D-07:** `[auto]` **Phase 3 (ACO):** manter e finalizar mapa visual cama-a-cama (estrutura local/quarto/cama, atribuicao/liberacao, feedback de erro e exportacao PDF mobile-first).
- **D-08:** `[auto]` **Phase 4 (FIN + ADM):** entregar dashboard financeiro e telas administrativas/auditoria com foco em leitura operacional e exportacao.

### Criterios de priorizacao para execucao do front
- **D-09:** `[auto]` Priorizar telas que fecham fluxo E2E com backend ja pronto, na ordem: participantes -> inscricoes/eventos -> financeiro/admin.
- **D-10:** `[auto]` Cada fase do frontend deve validar auth/protected routes e sincronizacao via TanStack Query para evitar divergencia entre middleware backend e estado de sessao na web.

### the agent's Discretion
- Granularidade dos planos de cada fase (quantidade de telas por plano) desde que respeite o mapeamento acima.
- Nivel de refinamento visual incremental por modulo, mantendo mobile-first e sem quebrar componentes existentes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap e requisitos de produto
- `.planning/ROADMAP.md` - fases 1..5 e dependencias do milestone atual.
- `.planning/REQUIREMENTS.md` - requisitos AUTH, PES, INS, ACO, FIN e ADM que dirigem as telas.
- `.planning/PROJECT.md` - principios de produto (mobile-first, baixo custo operacional, fluxo de retiro).
- `.planning/STATE.md` - contexto atual da execucao e regra de workflow.

### Contexto de fases anteriores
- `.planning/phases/02-core-business-inscricoes/02-CONTEXT.md` - decisoes de inscricoes/pagamentos para refletir no front da fase 2.
- `.planning/phases/03-gest-o-visual-cama-a-cama/03-CONTEXT.md` - decisoes de UX/fluxo do modulo de acomodacoes.

### Frontend implementado (fonte canonica)
- `apps/web/src/App.tsx` - roteamento e protecao de rotas.
- `apps/web/src/lib/auth.ts` - Better Auth client da web.
- `apps/web/src/lib/api.ts` - contrato de chamadas autenticadas para API.
- `apps/web/src/contexts/auth-context.tsx` - estado de sessao para UI.
- `apps/web/src/pages/login.tsx` - fluxo de login.
- `apps/web/src/pages/register.tsx` - fluxo de cadastro.
- `apps/web/src/pages/dashboard.tsx` - entrada de navegacao por modulos.
- `apps/web/src/pages/ParticipantsPage.tsx` - estado atual do modulo de participantes (placeholder).
- `apps/web/src/pages/AcomodacoesPage.tsx` - estado atual do modulo de acomodacoes.
- `apps/web/src/hooks/use-acomodacoes.ts` - padrao de queries/mutations do modulo de acomodacoes.

### Documento funcional/arquitetural
- `doc/koinonia-doc-tec.md` - referencia funcional ampla; tratar secoes legadas de Supabase Auth como desatualizadas quando conflitarem com codigo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/ui/card.tsx`, `button.tsx`, `input.tsx`, `sheet.tsx`, `alert.tsx`, `label.tsx`: base de UI reutilizavel para formularios/listagens/dashboard.
- `apps/web/src/components/acomodacoes/*`: conjunto pronto para mapa, atribuicao e exportacao de acomodacoes.
- `apps/web/src/hooks/use-acomodacoes.ts`: referencia de padrao para hooks de dados com TanStack Query.

### Established Patterns
- Protecao de rotas centralizada com `ProtectedRoute`.
- Sessao/autenticacao via `AuthProvider` + Better Auth client.
- Dados de servidor com Query/Mutation e invalidacao de cache por chave de modulo.
- Composicao de paginas por cards e secoes mobile-first.

### Integration Points
- Novas paginas devem entrar em `App.tsx` com `ProtectedRoute`.
- Novos modulos de dados devem seguir padrao de hook em `hooks/` + `lib/api.ts`.
- Fluxos de modulo devem refletir os endpoints `/api/v1` ja existentes no backend e contratos em `packages/shared`.

</code_context>

<specifics>
## Specific Ideas

### Diagnostico rapido do estado atual do front
- **Auth:** login/register + sessao protegida implementados e alinhados com Better Auth.
- **Acomodacoes:** modulo com boa cobertura de UI/hook (mapa, estrutura, atribuicao/liberacao, exportacao PDF).
- **Participantes:** pagina ainda placeholder, sem CRUD real.
- **Eventos/Inscricoes/Financeiro/Admin:** cards no dashboard, mas sem telas operacionais completas.

### Matriz de tarefas frontend por fase
- **Phase 1 (AUTH + PES):** concluir navegacao e CRUD completo de participantes com historico e soft-delete.
- **Phase 2 (INS):** criar paginas de eventos/inscricoes/pagamentos com filtros de status, papel e inadimplencia.
- **Phase 3 (ACO):** estabilizar UX e cobrir lacunas de robustez do modulo ja existente.
- **Phase 4 (FIN + ADM):** implementar dashboard financeiro, relatorios visuais e trilha de auditoria administrativa.

### Divergencia documentacao x codigo
- `doc/koinonia-doc-tec.md` ainda contem trechos de Supabase Auth/JWT em secoes arquiteturais.
- Decisao operacional: seguir Better Auth + PostgreSQL/Drizzle conforme implementacao corrente.

</specifics>

<deferred>
## Deferred Ideas

- Revisao completa editorial de `doc/koinonia-doc-tec.md` (higienizacao total de secoes legadas) em fase dedicada de documentacao.
- Refinamentos visuais avancados (design polish) apos fechamento funcional dos modulos MVP.
- Novas capacidades fora do roadmap atual (QR check-in, app nativo, portal publico).

</deferred>

---

*Phase: 05-fase-0-frontend-revis-o-do-projeto-e-mapeamento-de-tarefas-do-roadmap*
*Context gathered: 2026-04-12*
