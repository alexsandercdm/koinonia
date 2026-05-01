# Phase 07: Participantes CRUD UI - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Conectar a tela `ParticipantsPage` ao backend real para fechar o fluxo operacional de participantes no frontend: listagem, busca, cadastro, edicao e inativacao com preservacao de historico, mantendo compatibilidade com Better Auth, TanStack Query e contratos compartilhados.

Esta fase cobre os ajustes minimos de integracao necessarios para o CRUD funcionar de ponta a ponta. Nao adiciona novas capacidades de dominio fora do escopo de participantes.

</domain>

<decisions>
## Implementation Decisions

### Estrutura da experiencia de participantes
- **D-01:** `[auto]` A tela de participantes permanece dentro da rota `/participantes` e evolui do placeholder atual para uma experiencia operacional completa, sem criar um submodulo separado.
- **D-02:** `[auto]` A listagem deve continuar mobile-first e orientada a cards, reaproveitando a linguagem visual Hallowed Weight da Phase 6.5, com busca e filtros no topo e acoes de cadastro/edicao acessiveis sem navegar para outra pagina.
- **D-03:** `[auto]` O CTA "Adicionar Participante" e a acao "Ver ficha" devem abrir um sheet/drawer com formulario em 3 abas: Dados, Saude e Emergencia.

### Comportamento de dados e cache
- **D-04:** `[auto]` A busca do usuario deve responder primeiro sobre os dados ja em cache no cliente; quando online, a fase pode complementar com sincronizacao ao backend sem sacrificar resposta instantanea.
- **D-05:** `[auto]` O frontend deve parar de consumir `/api/v1/participantes` como array cru e passar a tratar o payload real paginado (`data` + `pagination`) em hooks dedicados.
- **D-06:** `[auto]` Mutations de criar, editar e inativar devem invalidar ou atualizar as query keys de participantes e historico de forma consistente, seguindo o padrao de `use-acomodacoes.ts`.

### Escopo de edicao e integracao backend
- **D-07:** `[auto]` Esta fase pode incluir ajustes minimos de backend estritamente necessarios para cumprir o CRUD de participantes no frontend, desde que permaneçam dentro do dominio de participantes e respeitem a arquitetura `routes -> controllers -> usecases -> repositories`.
- **D-08:** `[auto]` A edicao no UI deve ser apresentada como uma unica experiencia de formulario completo, mesmo que o planner precise quebrar isso em endpoints/steps tecnicos diferentes no backend.
- **D-09:** `[auto]` Historico do participante deve aparecer na mesma experiencia de ficha, como aba ou secao dedicada, evitando jogar o usuario para um fluxo desconectado.

### Permissoes e seguranca operacional
- **D-10:** `[auto]` Listagem, busca e visualizacao de historico seguem acessiveis para usuarios autenticados conforme backend atual; acoes de escrita devem refletir as restricoes por role ja existentes.
- **D-11:** `[auto]` A inativacao (soft-delete) deve ser tratada como acao destrutiva com confirmacao explicita e feedback claro de sucesso/erro, removendo o participante da lista ativa sem apagar historico.
- **D-12:** `[auto]` A interface deve deixar visivel quando uma acao nao esta disponivel por permissao, em vez de parecer quebrada ou silenciosamente falhar.

### Validacao e ergonomia do formulario
- **D-13:** `[auto]` Validacoes de campo devem acontecer sem depender do submit final, em linha com o criterio de sucesso da fase.
- **D-14:** `[auto]` O formulario deve priorizar os campos do schema compartilhado existente (`PessoaSchema` / DTOs) e evitar inventar campos novos nesta fase.

### the agent's Discretion
- Escolha entre sheet lateral ou modal responsivo, desde que mantenha boa usabilidade em mobile.
- Granularidade exata dos hooks (`useParticipantes`, `useParticipante`, `useParticipanteHistorico`, mutations) desde que siga os patterns do projeto.
- Estrategia de atualizacao otimista vs invalidacao simples por acao, respeitando offline grace e risco de inconsistencias.

</decisions>

<specifics>
## Specific Ideas

- A implementacao atual de `apps/web/src/pages/ParticipantsPage.tsx` ja aponta a direcao visual da listagem (cards, chips de filtro, CTA de cadastro), mas ainda esta desconectada do contrato real da API.
- A pagina hoje espera um array simples, enquanto `ListParticipantesUseCase` retorna `{ data, pagination }`; esse desalinhamento deve ser corrigido como parte da fase.
- O backend ja oferece:
  - `GET /api/v1/participantes`
  - `POST /api/v1/participantes`
  - `GET /api/v1/participantes/:id`
  - `GET /api/v1/participantes/:id/historico`
  - `PATCH /api/v1/participantes/:id/saude`
  - `DELETE /api/v1/participantes/:id`
- Como o objetivo da fase inclui "editar participante com formulario completo", o planner deve verificar se basta orquestrar o que ja existe ou se sera necessario completar o backend com suporte adicional de update para dados nao medicos.
- O fluxo ideal para operacao em retiro e: buscar rapidamente, abrir ficha, editar/cadastrar no mesmo contexto e voltar para a lista sem perda de estado.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Produto e fase
- `.planning/PROJECT.md` — objetivo do milestone v1.1, contexto operacional mobile-first e restricoes do MVP.
- `.planning/ROADMAP.md` — Phase 7 goal, dependencias e criterios de sucesso.
- `.planning/REQUIREMENTS.md` — requisitos `UI-PES-01` a `UI-PES-04` e requisitos canonicos de participantes `PES-01` a `PES-05`.
- `.planning/STATE.md` — estado atual do milestone e conclusao da infraestrutura da fase 06.
- `.planning/design/REDESIGN-IMPLEMENTATION-QUEUE.md` — organizacao das novas atualizacoes em `doc/koinonia-redesign` por fase e prioridade.
- `.planning/phases/06.5-frontend-redesign-migration/06.5-CONTEXT.md` — baseline visual Hallowed Weight que substitui o Stitch/dark-violet da Phase 5.

### Contexto herdado
- `.planning/phases/05-fase-0-frontend-revis-o-do-projeto-e-mapeamento-de-tarefas-do-roadmap/05-CONTEXT.md` — decisoes de baseline frontend, rota `/participantes` e prioridade do modulo de participantes.
- `.planning/phases/06-infrastructure-foundation/06-01-SUMMARY.md` — `ApiError` e dependencias que desbloqueiam formularios/UI.
- `.planning/phases/06-infrastructure-foundation/06-03-SUMMARY.md` — persistencia do cache TanStack Query para offline grace.

### Frontend existente
- `apps/web/src/pages/ParticipantsPage.tsx` — estado atual da tela e lacunas de integracao.
- `apps/web/src/components/layout/AppLayout.tsx` — shell e navegacao protegida.
- `apps/web/src/components/protected-route.tsx` — padrao de protecao de rota.
- `apps/web/src/hooks/use-acomodacoes.ts` — referencia de organizacao de query keys, queries e mutations.
- `apps/web/src/lib/api.ts` — contrato de `apiFetch` / `ApiError`.
- `apps/web/src/lib/auth.ts` — Better Auth client canonico no frontend.
- `apps/web/src/main.tsx` — persistencia de cache TanStack Query.
- `doc/koinonia-redesign/koinonia-pages-main.jsx` — referencia do drawer de participante em etapas e linguagem visual atual.

### Backend e contratos
- `apps/api/src/modules/pessoas/routes/participantes.ts` — endpoints e restricoes por role do dominio de participantes.
- `apps/api/src/modules/pessoas/controllers/ParticipanteController.ts` — composicao atual dos casos de uso.
- `apps/api/src/modules/pessoas/usecases/ListParticipantesUseCase.ts` — shape paginado real da listagem.
- `apps/api/src/modules/pessoas/usecases/GetParticipanteHistoricoUseCase.ts` — shape do historico de eventos por participante.
- `packages/shared/src/index.ts` — `PessoaSchema`, DTOs e tipos compartilhados usados pela web.

### Documentacao funcional ampla
- `doc/koinonia-doc-tec.md` — referencia funcional/arquitetural ampla; quando houver conflito com auth, seguir Better Auth conforme o codigo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `sheet.tsx`, `alert.tsx` — primitives suficientes para lista, formulario e confirmacoes sem introduzir novo pattern.
- `apps/web/src/components/layout/AppLayout.tsx` — wrapper padrao para paginas autenticadas com actions no header.
- `apps/web/src/hooks/use-acomodacoes.ts` — melhor referencia atual de hooks com query keys, invalidacao e mutations.

### Established Patterns
- Rotas autenticadas passam por `ProtectedRoute` em `apps/web/src/App.tsx`.
- Server state usa TanStack Query com chaves por dominio e invalidacao explicita.
- `apiFetch` centraliza credenciais, parsing e erros HTTP via `ApiError`.
- O projeto prefere aproveitar contratos de `packages/shared` em vez de duplicar tipos locais.

### Integration Points
- A nova camada de dados de participantes deve viver em hooks dedicados em `apps/web/src/hooks/`.
- A tela precisa conversar com os endpoints `/api/v1/participantes*` existentes e possiveis ajustes minimos do mesmo modulo backend.
- Historico de eventos deve se integrar ao endpoint `/api/v1/participantes/:id/historico`.
- O soft-delete precisa refletir o RBAC atual: delete admin-only no backend.

</code_context>

<deferred>
## Deferred Ideas

- Visualizacao de participante em rota propria dedicada (detalhe full-page) se o sheet ficar limitado demais.
- Segmentacao de UI por role com dashboards diferentes — fora do escopo desta fase.
- Recursos extras de importacao/exportacao de participantes.

</deferred>

---

*Phase: 07-participantes-crud-ui*
*Context gathered: 2026-04-26*
