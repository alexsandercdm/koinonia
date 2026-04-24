# Phase 03: Gestao Visual Cama-a-Cama - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar o modulo de acomodacao do MVP com cadastro hierarquico de locais, quartos e camas, visualizacao operacional do mapa por evento/local, atribuicao e liberacao de camas com regras estritas de genero e ocupacao, e exportacao do mapa em PDF para uso offline.

Esta fase fecha o fluxo de alocacao cama-a-cama em cima das inscricoes ja existentes. Comentarios, check-in QR code, app nativo, notificacoes e refinamentos visuais extras ficam fora deste recorte.

</domain>

<decisions>
## Implementation Decisions

### Auto-selected decisions
- **D-01:** `[auto]` Selecionadas todas as gray areas para resolucao automatica: modelo de interacao do mapa, escopo hierarquico da acomodacao, fluxo de atribuicao/liberacao, visualizacao operacional e estrategia de exportacao.

### Interaction model
- **D-02:** `[auto]` Priorizar atribuicao por modal/painel lateral (`Sheet`) acionado a partir da cama, em vez de drag-and-drop livre.
- **D-03:** `[auto]` A experiencia precisa ser mobile-first; no mobile, o painel de atribuicao ocupa quase toda a tela com scroll interno.

### Accommodation hierarchy and event scoping
- **D-04:** `[auto]` Manter a hierarquia `local -> quarto -> cama` como estrutura canonica do modulo, sem duplicar mapas por evento.
- **D-05:** `[auto]` O mapa operacional da fase deve ser consultado no contexto de um evento, usando `eventos.local_id` para apontar qual estrutura de acomodacao sera exibida.
- **D-06:** `[auto]` Cadastro e manutencao de locais/quartos/camas fazem parte desta fase, porque os requisitos `ACO-01` a `ACO-03` sao base obrigatoria para o mapa visual.

### Assignment and release behavior
- **D-07:** `[auto]` A atribuicao de cama deve operar apenas sobre inscritos ativos do evento e sem cama alocada no momento da busca.
- **D-08:** `[auto]` Validacao de genero e disponibilidade da cama permanece obrigatoriamente no backend, com transacao e protecao contra concorrencia para evitar dupla atribuicao.
- **D-09:** `[auto]` Liberar cama deve ser uma acao explicita que remove apenas a vinculacao `inscricoes.cama_id`, sem cancelar a inscricao nem afetar historico financeiro.
- **D-10:** `[auto]` Nao havera bypass manual para incompatibilidade de genero ou cama ocupada no MVP; erros devem ser retornados de forma clara para a UI.

### Visual map and operator feedback
- **D-11:** `[auto]` O mapa deve ser renderizado como grade de cards por quarto, nao como tabela simples.
- **D-12:** `[auto]` Cada card de cama deve exibir identificacao da cama, status visual e nome do ocupante quando houver atribuicao.
- **D-13:** `[auto]` O status operacional minimo do mapa sera `disponivel`, `ocupado` e `bloqueado`, com destaque visual imediato para uso em campo.
- **D-14:** `[auto]` Atribuicao e liberacao devem atualizar o mapa em tempo quase real via refetch/invalidation do TanStack Query, sem depender de refresh manual da pagina.

### Export and offline usage
- **D-15:** `[auto]` A exportacao em PDF deve partir do frontend, reaproveitando `jsPDF`/`html2canvas` ja presentes na stack web.
- **D-16:** `[auto]` O PDF deve refletir o mesmo agrupamento visual por quarto do mapa operacional, priorizando legibilidade offline em vez de layout altamente customizado.

### Access and operational roles
- **D-17:** `[auto]` `admin` e `lider` podem cadastrar estrutura de acomodacao e operar atribuicoes; `servo` fica apenas com visualizacao do mapa quando essa exposicao for disponibilizada na interface.

### the agent's Discretion
- Detalhes exatos de densidade visual, tipografia e microcopy do mapa.
- Estrategia de bloqueio manual de cama, desde que preserve o status operacional `bloqueado`.
- Nivel de detalhamento do PDF alem das informacoes minimas ja definidas.

</decisions>

<specifics>
## Specific Ideas

- A documentacao tecnica do projeto ja descreve o mapa como uma grade de cards por quarto com cores de status e painel lateral para atribuicao.
- O fluxo atual do repositorio sugere continuidade natural entre fase 2 e fase 3 via `inscricoes.cama_id` opcional ate o momento da alocacao.
- A rota de dashboard ja reserva um ponto de entrada para "Acomodações", o que favorece encaixar o modulo como nova area protegida da aplicacao.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope and phase framing
- `.planning/ROADMAP.md` — objetivo da fase 3, requisitos `ACO-01` a `ACO-07` e limite de escopo.
- `.planning/REQUIREMENTS.md` — definicao detalhada dos requisitos de acomodacao do MVP.
- `.planning/PROJECT.md` — principios do produto, mobile-first e prioridade de regras estritas de genero/capacidade.
- `.planning/STATE.md` — preferencias atuais do workflow e obrigatoriedade de seguir `tlc-spec-driven`.
- `.planning/phases/02-core-business-inscricoes/02-CONTEXT.md` — decisoes anteriores que mantem `inscricoes.cama_id` opcional ate a atribuicao e definem papeis operacionais base.

### Domain and UX specification
- `doc/koinonia-doc-tec.md` — especificacao funcional e tecnica do modulo de acomodacao, incluindo regras de negocio, endpoints esperados e direcao de UX do mapa.

### Backend contracts and persistence
- `apps/api/src/db/schema.ts` — schema atual de `locais`, `quartos`, `camas`, `eventos` e `inscricoes`, incluindo `eventos.local_id` e `inscricoes.cama_id`.
- `packages/shared/src/index.ts` — enums e DTOs compartilhados para genero de quarto, tipo de cama e vinculacao de inscricoes.
- `apps/api/src/tests/helpers/setupTestDB.ts` — baseline de limpeza/seeding que ja contempla tabelas de acomodacao para testes integrados.

### Frontend integration points
- `apps/web/src/App.tsx` — roteamento protegido atual e ponto de extensao para nova pagina de acomodacoes.
- `apps/web/src/pages/dashboard.tsx` — entrada atual do dashboard que ja expoe o card de "Acomodações".
- `apps/web/src/components/ui/card.tsx` — padrao de card reutilizavel para compor a grade por quarto/cama.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/api/src/db/schema.ts`: a hierarquia `locais -> quartos -> camas` e o vinculo `inscricoes.cama_id` ja existem no banco.
- `packages/shared/src/index.ts`: enums `GeneroQuartoEnum` e `TipoCamaEnum` e schemas compartilhados reduzem divergencia entre API e web.
- `apps/web/src/components/ui/card.tsx`: card base reaproveitavel para montar blocos de quarto e cama.
- `apps/web/src/pages/dashboard.tsx`: ja existe entrada visual para o modulo de acomodacoes no dashboard.

### Established Patterns
- Backend segue modular monolith com Fastify + Drizzle + Zod; novos fluxos devem entrar como modulo com use cases, repositories e rotas finas.
- Frontend usa React Router protegido, TanStack Query e Tailwind/Shadcn-style components.
- O projeto privilegia mobile-first e interacoes operacionais simples, sem depender de gestos complexos para o fluxo principal.

### Integration Points
- A visualizacao do mapa depende de `eventos.local_id` para resolver a estrutura de acomodacao correta.
- A atribuicao conecta o modulo de acomodacao ao modulo de inscricoes via `inscricoes.cama_id`.
- O dashboard e o roteamento protegido da web sao os pontos imediatos de encaixe para a interface do mapa.

</code_context>

<deferred>
## Deferred Ideas

- Drag-and-drop direto no mapa como alternativa adicional ao fluxo por `Sheet`.
- Melhorias avancadas de visualizacao para `servo` alem da consulta basica do mapa.
- Customizacoes visuais de PDF por evento ou template de impressao.

</deferred>

---

*Phase: 03-gest-o-visual-cama-a-cama*
*Context gathered: 2026-04-01*
