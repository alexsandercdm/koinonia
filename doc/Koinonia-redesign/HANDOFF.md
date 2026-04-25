# Handoff — Redesign Hallowed Weight

**Sessão originária:** 2026-04-25 — audit + decisões de roadmap concluídos.
**Próximo passo:** executar a sequência GSD em sessão limpa.

---

## Contexto enxuto (leia primeiro)

Substituir o design system **Stitch** (dark/purple/amber) atualmente implementado em `apps/web/src/` pelo redesign **Hallowed Weight** (cream/gold/black) entregue em `doc/Koinonia-redesign/`.

**Não é refinamento — é substituição completa:**
- Paleta invertida (light vs dark)
- Filosofia oposta (declarativa/arquitetural vs decorativa/digital)
- 12 primitivas novas + AppShell com EventPill + Event Selector Screen

**Artifacts de referência:**
- [doc/Koinonia-redesign/UI-REVIEW.md](doc/Koinonia-redesign/UI-REVIEW.md) — audit 6 pilares, score 10/24, decisões pendentes
- [doc/Koinonia-redesign/uploads/design-philosophy-hallowed-weight.md](doc/Koinonia-redesign/uploads/design-philosophy-hallowed-weight.md) — filosofia
- [doc/Koinonia-redesign/Koinonia Design.html](doc/Koinonia-redesign/Koinonia%20Design.html) + `Koinonia Design v2.html` — mockups
- [doc/Koinonia-redesign/koinonia-primitives.jsx](doc/Koinonia-redesign/koinonia-primitives.jsx) — 12 primitivas
- [doc/Koinonia-redesign/koinonia-layout.jsx](doc/Koinonia-redesign/koinonia-layout.jsx) — AppShell + Sidebar + EventPill
- [doc/Koinonia-redesign/koinonia-page-login.jsx](doc/Koinonia-redesign/koinonia-page-login.jsx)
- [doc/Koinonia-redesign/koinonia-page-eventos.jsx](doc/Koinonia-redesign/koinonia-page-eventos.jsx) — Event Selector Screen
- [doc/Koinonia-redesign/koinonia-page-acomodacoes.jsx](doc/Koinonia-redesign/koinonia-page-acomodacoes.jsx)
- [doc/Koinonia-redesign/koinonia-pages-main.jsx](doc/Koinonia-redesign/koinonia-pages-main.jsx) — Dashboard/Participantes/Inscrições/Financeiro
- [doc/Koinonia-redesign/koinonia-data.jsx](doc/Koinonia-redesign/koinonia-data.jsx) — mock data + EVENTO_STATUS

---

## Decisões já lockadas

### D1 — Arquitetura de estilo: **Tailwind tokens** (não inline styles)
Portar o objeto `C` do redesign para `apps/web/tailwind.config.js` + `apps/web/src/index.css` como tokens semânticos. Manter shadcn/ui como base de Sheet/Dialog mas remapear paleta. Justificativa: preserva ergonomia atual e mantém theming/dark-mode futuro possível.

### D2 — Estrutura no roadmap: **inserir Phase 6.5**
Não fundir com Phase 7 (Participantes CRUD UI). Phase 6.5 dedicada ao redesign isola a substituição do design system. P7-P10 continuam mas re-baseadas no novo sistema.

---

## Phase 6.5 — escopo confirmado

**Nome:** Frontend Redesign (Hallowed Weight)

**Goal:** Substituir o design system Stitch (dark/purple/amber) pelo Hallowed Weight (cream/gold/black). Implementar 12 primitivas, AppShell com EventPill, Event Selector Screen, e migrar todas as páginas existentes para o novo sistema.

**Requirements derivados (UX-01 a UX-07):**

| ID    | Requirement                                                                                       |
|-------|---------------------------------------------------------------------------------------------------|
| UX-01 | Paleta cream/gold/black aplicada via Tailwind tokens (substitui Stitch)                           |
| UX-02 | DM Sans + Material Symbols como tipografia única; banir `font-black` e lucide-react              |
| UX-03 | 12 primitivas: Btn, Input, Card, Badge, Drawer, FormField, FilterTabs, EmptyState, SectionTitle, SelectInput, TextArea, QRCodeSVG |
| UX-04 | AppShell com Sidebar 232px + Header 56px contendo EventPill (switcher contextual)                |
| UX-05 | Event Selector Screen como rota intermediária pós-login                                          |
| UX-06 | Login two-column (editorial left panel + form right)                                              |
| UX-07 | Todas as páginas existentes migradas: Dashboard, Participantes, Inscrições, Acomodações, Financeiro, Register |

**Tokens de cor (referência rápida):**
```
bg          #F7F4EF    surface       #FFFFFF       surfaceRaised  #FDFCFA
border      #E8E3D9    borderStrong  #CFC8BB
text        #1A1612    textSec       #7A7060       textTer        #B0A898
gold        #C4923A    goldLight     #F5ECD9       goldMuted      #EDD8AD
success     #3D7A52    successLight  #E8F4ED
warning     #B07030    warningLight  #FBF0E2
danger      #9B3A2E    dangerLight   #FBECEC
info        #2E628B    infoLight     #E8F2FA
```

---

## Sequência a executar (em sessão limpa, na ordem)

```
1. /gsd-insert-phase 6.5
   → cria entry no ROADMAP + diretório .planning/phases/06.5-*

2. /gsd-ui-phase 6.5
   → gera UI-SPEC.md a partir deste handoff + UI-REVIEW + arquivos do redesign
   → locka decisão D1 (Tailwind tokens), tokens de cor, 12 primitivas, AppShell

3. /gsd-plan-phase 6.5
   → quebra em waves de execução (sugestão: Foundation → AppShell → Pages)

4. /gsd-execute-phase 6.5
   → execução com commits atômicos
```

**Ao iniciar a próxima sessão:**
1. Diga "leia [doc/Koinonia-redesign/HANDOFF.md](doc/Koinonia-redesign/HANDOFF.md) e prossiga"
2. Ou cole o caminho deste arquivo direto
3. O assistente terá contexto suficiente sem reler o histórico desta sessão

---

## Estado do worktree

- **Branch:** `claude/naughty-varahamihira-f3f4d6`
- **Worktree:** `.claude/worktrees/naughty-varahamihira-f3f4d6/`
- **Não comitado:** `doc/Koinonia-redesign/` (pasta inteira) + este `HANDOFF.md` + `UI-REVIEW.md`
- **Sugestão antes de continuar:** comitar `doc/Koinonia-redesign/` para preservar entrada do redesign no histórico antes de iniciar a Phase 6.5.
