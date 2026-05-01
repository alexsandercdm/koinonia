# Phase 08: Eventos CRUD UI + Design System Alignment - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning after Phase 7

<domain>
## Phase Boundary

Criar a experiencia funcional de eventos no frontend: rota `/eventos`, listagem, criacao, edicao, status/capacidade e selecao de evento no shell. A fase tambem deve corrigir a organizacao visual do frontend necessaria para que Eventos e o shell sigam o design system oficial entregue pelo time de design em `doc/Design System Koinonia.html`.

Esta fase nao implementa inscricao, pagamento, check-in persistido ou acomodacao. Ela fornece o modulo de eventos, o contexto de evento que as fases seguintes usarao e a consolidacao de primitives/tokens/shell necessaria para parar a divergencia visual do frontend.

</domain>

<decisions>
## Implementation Decisions

### Fonte visual canonica
- **D-01:** `doc/Design System Koinonia.html` e a referencia canonica para tokens, tipografia, componentes, layout shell e patterns visuais desta fase.
- **D-02:** Quando `doc/Design System Koinonia.html` conflitar com `doc/Koinonia-redesign/*`, o HTML novo vence para decisao visual. Os arquivos JSX antigos continuam uteis como referencia de fluxo, mas nao como fonte final de estilo.
- **D-03:** O baseline "Hallowed Weight" continua valido em direcao geral, mas deve ser refinado pelos detalhes do design system: DM Sans, Material Symbols Rounded, superficies quentes, ouro contido, bordas/radius menores e hierarquia operacional mais densa.

### Organizacao do frontend e primitives
- **D-04:** Antes de implementar `EventosPage`, o planner deve verificar e ajustar os primitives compartilhados que a tela e o shell vao usar: `Button`, `Badge`, `Card`, `Input`, `Select`, `TextArea`, `FormField`, `FilterTabs`, `Sheet/Drawer` e `EmptyState`.
- **D-05:** Tokens devem ficar centralizados em `apps/web/src/index.css` e `apps/web/tailwind.config.js`; nao espalhar hex values do design system nas paginas.
- **D-06:** A fase deve corrigir divergencias visuais evidentes nos componentes/shell tocados por Eventos, em vez de criar uma segunda linguagem visual local para a pagina.
- **D-07:** Nao transformar esta fase em redesign completo de todas as paginas existentes. Ajustes compartilhados que melhoram o frontend inteiro sao permitidos; reescrever paginas fora do caminho de Eventos pertence a fase propria, salvo regressao causada por primitive compartilhado.

### Tokens, tipografia e iconografia
- **D-08:** Fonte primaria do app deve ser `DM Sans`, conforme design system. O planner deve verificar se o carregamento da fonte sera feito via CSS/import ou fallback local apropriado.
- **D-09:** Iconografia de dominio e navegacao deve seguir Material Symbols Rounded (`opsz 20`, `wght 300`, `FILL 0/1`, `GRAD 0`) quando coerente com o design system. Icones utilitarios existentes podem permanecer se nao criarem inconsistencia visual relevante.
- **D-10:** Tokens canonicos do design system para esta fase:
  - `bg #F7F4EF`
  - `surface #FFFFFF`
  - `surfaceRaised #FDFCFA`
  - `border #E8E3D9`
  - `borderStrong #CFC8BB`
  - `text #1A1612`
  - `textSec #7A7060`
  - `textTer #B0A898`
  - `gold #C4923A`
  - `goldMuted #EDD8AD`
  - `goldLight #F5ECD9`
  - `success #3D7A52` / `successLight #E8F4ED`
  - `warning #B07030` / `warningLight #FBF0E2`
  - `danger #9B3A2E` / `dangerLight #FBECEC`
  - `info #2E628B` / `infoLight #E8F2FA`

### Layout shell e contexto de evento
- **D-11:** A rota `/eventos` deve ser adicionada ao `App.tsx` como rota protegida.
- **D-12:** `AppLayout` deve incluir Eventos na navegacao desktop e mobile seguindo o design system: sidebar colapsavel/compacta, item ativo com `goldLight` + borda esquerda `gold`, header de 56px e `EventPill` no header.
- **D-13:** O `EventPill` deve evoluir de texto estatico para seletor real de evento usando dados de `/api/v1/eventos`, compartilhando a query key de eventos com as demais telas.
- **D-14:** A primeira versao do evento selecionado pode viver no cliente, com persistencia local se necessario. Nao criar backend de preferencias nesta fase sem decisao explicita.

### EventosPage
- **D-15:** `EventosPage` deve usar cards operacionais alinhados ao design system: card radius 10px, padding padrao 20px, border `border`, hover `borderStrong` + shadow raised, status badge, datas, local quando disponivel, capacidade e acoes.
- **D-16:** Filtros de status devem usar `FilterTabs` com wrapper `surface`, borda, radius 8px, item ativo em `text` com texto branco e font-weight 600.
- **D-17:** Criacao e edicao devem usar drawer/sheet alinhado ao design system: largura 440-520px para formulario, header com padding 18px 24px, body 24px, footer 16px 24px, overlay `rgba(26,22,18,0.28)` e shadow de drawer.
- **D-18:** Acoes de escrita devem ser admin-only no UI, alinhadas ao backend `requireRole('admin')`.

### Component specs que devem guiar a implementacao
- **D-19:** Buttons devem seguir variants do design system: `primary` com `text #1A1612` como fundo e branco como texto; `secondary` transparente com borda; `gold`; `ghost`; `danger`.
- **D-20:** Badges devem seguir padding `2px 8px`, radius `99px`, font-size `11px`, weight 500 e letter-spacing `0.02em`.
- **D-21:** Inputs/selects/textareas devem usar radius 7px, fundo `surface`, borda `border`, foco com `goldMuted` + ring `0 0 0 3px goldLight`.
- **D-22:** Tabelas e listas operacionais devem seguir header `surfaceRaised`, labels uppercase/caption, cells com padding aproximado `13px 16px`, row hover sutil e acoes em `gold`.
- **D-23:** Barras de progresso devem usar track `#F0EDE8`, radius 99px, altura 6px para progresso principal e cor semantica conforme estado.

### Contratos e status
- **D-24:** Runtime enum canonico e `StatusEventoEnum`: `rascunho`, `aberto`, `encerrado`, `realizado`, `cancelado`.
- **D-25:** Status do design devem ser display-only, sem alterar enum backend:
  - `rascunho` -> `Planejamento`
  - `aberto` -> `Aberto`
  - `encerrado` -> `Encerrado`
  - `realizado` -> `Realizado`
  - `cancelado` -> `Cancelado`
- **D-26:** Capacidade deve ser exibida a partir de `capacidade_maxima` e contagem de inscritos somente se a API fornecer esse dado; caso contrario, exibir capacidade cadastrada sem inventar ocupacao.

### Check-in
- **D-27:** `CheckinOverlay` e QR visual permanecem referencia ate existir contrato de dominio para check-in.
- **D-28:** Nao persistir check-in falso no frontend. Se o MVP exigir check-in, abrir spike/phase especifica com backend, auditoria e status por inscricao.

### the agent's Discretion
- Nome e localizacao de hooks, desde que os query keys sejam explicitamente do dominio de eventos.
- Persistencia local do evento selecionado, se melhorar continuidade entre paginas.
- Quebra de componentes entre `pages/EventosPage.tsx`, `components/eventos/*`, `hooks/use-eventos.ts` e helpers de status.
- Forma exata de carregar `DM Sans`, desde que a entrega final reflita a fonte canonica ou tenha fallback justificado.

</decisions>

<specifics>
## Specific Ideas

- O time de design entregou `doc/Design System Koinonia.html` para organizar o frontend porque a implementacao atual ficou fora do padrao visual desejado.
- O design system define Koinonia como sistema quente, serio e acolhedor, usando tons terrosos e dourados sobre superficies creme.
- A hierarquia tipografica canonica usa: Display 40/300, H1 22/600, H2 16/600, H3 14/600, Body 14/400, Small 13/400, Caption 12/400 e Label 11/600 uppercase.
- O design system inclui um AppShell com sidebar compacta de 56px, expandida de 220px, header fixo de 56px, `EventPill` com badge de status e acao "Novo evento".
- O backend ja possui:
  - `GET /api/v1/eventos`
  - `GET /api/v1/eventos/:id`
  - `POST /api/v1/eventos`
  - `PUT /api/v1/eventos/:id`
- O backend exige admin para create/update de eventos. O frontend deve esconder ou desabilitar drawer de criacao/edicao para roles sem permissao.
- A API atual retorna eventos sem uma contagem agregada de inscritos no `EventoRepository.list()`. Se o design exigir ocupacao real no card, o planner deve decidir entre:
  - adicionar agregado no backend com testes, ou
  - adiar a barra de ocupacao real para Phase 9 e exibir apenas capacidade nesta fase.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system oficial
- `doc/Design System Koinonia.html` — fonte canonica para tokens, tipografia, componentes, shell, status, drawer, tabelas, progresso e EventPill.

### Produto e planejamento
- `.planning/ROADMAP.md` — Phase 8 goal, dependencias e criterios de sucesso.
- `.planning/REQUIREMENTS.md` — requisitos `UI-EVT-01` e `UI-EVT-02`.
- `.planning/design/REDESIGN-IMPLEMENTATION-QUEUE.md` — organizacao geral das atualizacoes do redesign e separacao entre eventos, inscricoes, pagamentos e check-in.
- `.planning/phases/06.5-frontend-redesign-migration/06.5-CONTEXT.md` — baseline visual anterior que agora deve ser refinado pelo design system HTML.
- `.planning/phases/07-participantes-crud-ui/07-CONTEXT.md` — fase anterior e padroes de CRUD/drawer que devem permanecer coerentes.

### Design legado/util para fluxo
- `doc/Koinonia-redesign/koinonia-layout.jsx` — nav com Eventos e EventPill/dropdown; usar como referencia de fluxo, nao como estilo final quando conflitar com o HTML.
- `doc/Koinonia-redesign/koinonia-page-eventos.jsx` — event selector, event cards, drawer e check-in overlay visual.
- `doc/Koinonia-redesign/koinonia-primitives.jsx` — primitives antigas que ajudaram a Phase 6.5, agora secundarias ao HTML.
- `doc/Koinonia-redesign/koinonia-data.jsx` — status maps e mocks usados pelo design; runtime enum continua canonico.

### Frontend runtime
- `apps/web/src/index.css` — tokens CSS atuais a verificar contra o design system.
- `apps/web/tailwind.config.js` — theme extension atual a alinhar com tokens e radius do design system.
- `apps/web/src/App.tsx` — adicionar rota protegida `/eventos`.
- `apps/web/src/components/layout/AppLayout.tsx` — adicionar nav item, EventPill real e corrigir shell/header/sidebar conforme design system.
- `apps/web/src/components/ui/*` — primitives compartilhadas a auditar e ajustar antes da tela de eventos.
- `apps/web/src/hooks/use-inscricoes.ts` — referencia atual de `useEventos`, mas a fase deve considerar extrair hooks de eventos para `use-eventos.ts`.
- `apps/web/src/hooks/use-acomodacoes.ts` — tambem define `useEventos`; consolidar para evitar duplicacao.
- `apps/web/src/contexts/auth-context.tsx` — role do usuario para controle admin-only.
- `apps/web/src/lib/api.ts` — `apiFetch` e `ApiError`.

### Backend e contratos
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — endpoints `/eventos*` e RBAC.
- `apps/api/src/modules/inscricoes/controllers/EventoController.ts` — controller atual.
- `apps/api/src/modules/inscricoes/usecases/CreateEventoUseCase.ts` — regras de criacao.
- `apps/api/src/modules/inscricoes/usecases/UpdateEventoUseCase.ts` — regras de edicao.
- `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts` — listagem atual sem agregado de inscritos.
- `packages/shared/src/index.ts` — `EventoSchema`, `CreateEventoDTO`, `UpdateEventoDTO`, `StatusEventoEnum`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button`, `Card`, `Badge`, `Input`, `Select`, `FormField`, `TextArea`, `FilterTabs`, `Sheet` e `EmptyState` existem em `apps/web/src/components/ui`.
- `index.css` ja tem parte dos tokens quentes da Phase 6.5, mas precisa ser validado contra o HTML novo, incluindo `DM Sans`, `goldMuted`, radius e specs de focus.
- `tailwind.config.js` expoe tokens HSL e radius genericos; o planner deve evitar criar tokens paralelos e ajustar extensoes existentes.
- `use-inscricoes.ts` e `use-acomodacoes.ts` ja usam `/api/v1/eventos`; consolidar query keys evita refetch divergente.
- `AppLayout` ja possui shell responsivo e placeholder de evento ativo; precisa evoluir para Eventos na nav e event selector real.

### Established Patterns
- Rotas protegidas passam por `ProtectedRoute`.
- Server state usa TanStack Query.
- Backend segue `routes -> controllers -> usecases -> repositories`.
- Better Auth e role `admin` controlam escrita.
- Frontend usa Tailwind + `cn`/`tailwind-merge` em primitives, entao ajustes de design devem preferir variants/classes compartilhadas.

### Current Mismatches To Investigate
- `AppLayout` atual usa sidebar larga fixa (`w-64`) e item ativo com fundo `primary`; o design system pede sidebar compacta/expandida, ativo em `goldLight` + borda esquerda `gold`.
- Header atual usa `min-h-16`; o design system especifica header 56px.
- O placeholder "Evento ativo / Retiro Koinonia / Selecionar" deve virar `EventPill` real.
- Componentes atuais usam radius `rounded-lg`/`--radius: 0.5rem`; design system especifica button/input 7px, card 10px, tabs container 8px e pills 99px.
- O app mistura `lucide-react` e Material Symbols; a fase deve alinhar iconografia de navegacao/dominio ao design system.

### Integration Points
- `EventosPage` deve invalidar `['eventos']` apos create/update.
- Event selector global deve compartilhar a mesma query key de eventos usada por inscricoes/acomodacoes.
- Se houver selected event persistido, paginas de inscricoes, financeiro e acomodacoes podem passar a usar esse valor como default em fases seguintes.
- Ajustes em primitives compartilhados podem afetar Participantes/Acomodacoes/Financeiro; o planner deve incluir verificacao visual e build/type-check do frontend.

</code_context>

<deferred>
## Deferred Ideas

- Check-in QR persistido.
- Evento inicial como tela obrigatoria de selecao antes do dashboard.
- Agregados ricos de ocupacao/receita por evento se exigirem backend novo fora de `UI-EVT-01/02`.
- Preferencia de evento selecionado persistida no servidor.
- Redesign completo de paginas fora do caminho de Eventos quando nao for consequencia de primitive/shell compartilhado.

</deferred>

---

*Phase: 08-eventos-crud-ui*
*Context gathered: 2026-04-26*
