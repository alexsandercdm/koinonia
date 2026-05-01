# UI Review — Koinonia Redesign (Hallowed Weight)

**Tipo:** Audit retroativo de gap. Compara a UI implementada (`apps/web/src/`, commit `71e8cea` — Stitch design system dark/purple/amber) contra o redesign-alvo entregue em `doc/Koinonia-redesign/` (paleta clara cream/gold + filosofia "Hallowed Weight").

**Data:** 2026-04-25
**Alvo:** Frontend completo (todas as páginas + shell + primitivas)
**Última fase concluída:** 06 — Infrastructure Foundation (backend/infra; sem UI-SPEC)

> ⚠️ **Não é uma revisão cosmética.** O redesign não refina a UI atual — ele a substitui. Paleta inversa (light vs dark), filosofia oposta (arquitetural/atemporal vs vibrante/digital), arquitetura de estilo diferente (inline `C` object vs Tailwind+shadcn). A pontuação reflete a distância entre o entregue e o alvo, não a qualidade do que existe.

---

## ━━━ Score Summary ━━━

**Overall: 10/24** — Substituição completa recomendada.

| Pilar              | Score | Veredicto                                                |
|--------------------|-------|----------------------------------------------------------|
| Copywriting        | 2/4   | PT-BR está lá, mas tom é vibrante/CAPS — alvo é editorial |
| Visuals            | 1/4   | Linguagem visual oposta (decorativa vs declarativa)      |
| Color              | 1/4   | Paleta totalmente invertida — pivot 100%                 |
| Typography         | 2/4   | Material Symbols ✓; escala/pesos/spacing divergem        |
| Spacing            | 2/4   | Sistema consistente mas escala alvo é mais densa         |
| Experience Design  | 2/4   | Core flows OK; faltam patterns-chave (EventPill, Selector) |

---

## 1. Copywriting — 2/4

### Achados

| # | Atual                                                  | Alvo                                                               | Severidade |
|---|--------------------------------------------------------|--------------------------------------------------------------------|------------|
| 1 | `ENTRAR NO PAINEL` (font-black uppercase)              | `Entrar no painel` (sentence case, fontWeight 600)                 | Alta       |
| 2 | "Métricas Atuais" (heading nu)                         | "Acesso ao painel" como eyebrow uppercase 11px + heading separado  | Alta       |
| 3 | "Crie uma conta" (CTA secundário)                      | "Solicitar conta" (linguagem editorial — não auto-serviço)         | Média      |
| 4 | Sem greeting dinâmico                                  | "Bom dia/Boa tarde/Boa noite, {nome}" no Event Selector            | Alta       |
| 5 | Tagline ausente no login                               | "Sistema open-source para igrejas e ministérios" (footer left col) | Média      |
| 6 | Pitch ausente no painel editorial                      | "Organize inscrições, acomodações e finanças do seu retiro — para que sua atenção fique onde importa." | Alta |
| 7 | Status `Em andamento` indicador `Ao vivo` ausente      | `Ao vivo` com dot pulsante verde ao lado de eventos ativos         | Média      |
| 8 | "Não tem uma conta?" + "Crie uma conta"                | "Ainda não tem acesso?" + "Solicitar conta"                        | Baixa      |

### Diagnóstico
A UI atual usa voz **agressiva/marketing** (uppercase, "ENTRAR", font-black, exclamações implícitas). O alvo é **editorial/sereno** (sentence case, eyebrows uppercase mas tipografia de corpo calma, frases que respiram). A filosofia "Hallowed Weight" exige economia verbal — uma frase carrega o peso, não três.

### Recomendações
- Substituir todos os `uppercase font-black` por `sentence case + fontWeight 500-600`.
- Reservar `text-transform: uppercase + letter-spacing: 0.1em + size 11px` apenas para **eyebrows** (rótulos sobre headings).
- Adicionar greeting dinâmico no Event Selector + tagline editorial no login.

---

## 2. Visuals — 1/4

### Achados

| # | Atual                                                    | Alvo                                                          | Severidade |
|---|----------------------------------------------------------|---------------------------------------------------------------|------------|
| 1 | Hero card 280px com photo background + overlay           | Card com `borderLeft: 3px solid gold`, sem foto, denso        | Crítica    |
| 2 | Cards com `border-purple/50` translúcido + hover scale   | Cards com `border: 1px solid #E8E3D9` sólido, sem hover scale | Alta       |
| 3 | Ícones via `lucide-react` (`Users`, `Plus`, `ArrowRight`)| Material Symbols (`group`, `add`, `arrow_forward`) com `ms`/`ms-fill` | Alta |
| 4 | KPI card: ícone grande no canto + valor + label          | KPI card: chip 36×36 com colorLight bg + valor 24/600 + label 12 + sub 11 | Alta |
| 5 | `rounded-xl` (1rem) e `rounded-2xl` (1.5rem)             | `borderRadius: 7-8` consistente; 99 só para badges/progress   | Alta       |
| 6 | Botões com `shadow-amber-accent/20` (drop shadow colorido)| Botões sem shadow (peso vem do contrast), exceto Drawer       | Média      |
| 7 | Sem QRCodeSVG primitive                                  | QRCodeSVG inline como check-in pattern                        | Média      |
| 8 | Badge: `px-3 py-0.5 uppercase tracking-wider`            | Badge: `padding 2px 8px, borderRadius 99, fontSize 11/500`    | Média      |
| 9 | EventPill switcher ausente no header                     | EventPill: pílula com calendar icon, nome, badge status, chevron + dropdown | Crítica |
| 10| Sidebar: nav items com `bg-primary/20 + border-l-4`      | Sidebar: items mais discretos, accent gold sutil quando ativo | Média      |
| 11| Empty states ad-hoc                                      | `EmptyState` primitive padronizado                            | Média      |
| 12| Drawer ausente; usa `Sheet` shadcn                       | `Drawer` próprio (sliding right, header+body+footer)          | Média      |

### Diagnóstico
A UI atual é **decorativa** — fotos, gradients, shadows coloridas, hover scales, bordas translúcidas. O alvo é **declarativa** — superfícies sólidas, ouro como acento escasso (1× por composição), shape como estrutura ("the rectangle is a wall"). Os 60KB de `Koinonia Design.html` confirmam: zero imagens decorativas, zero gradients ornamentais.

### Recomendações
- Remover hero photo do dashboard. Substituir por `EventBanner` com `borderLeft gold + meta line + progress bar`.
- Criar `apps/web/src/lib/icons.tsx` mapeando Material Symbols ao invés de lucide-react.
- Construir as 12 primitivas do redesign como componentes Tailwind: `Btn`, `Input`, `SelectInput`, `TextArea`, `FormField`, `Card`, `EmptyState`, `Drawer`, `SectionTitle`, `QRCodeSVG`, `FilterTabs`, `Badge`.
- Adotar `EventPill` no header como switcher global de evento (substitui `<select>` HTML em [AcomodacoesPage.tsx](apps/web/src/pages/AcomodacoesPage.tsx)).

---

## 3. Color — 1/4

### Tabela comparativa

| Token semântico   | Atual (Stitch dark)        | Alvo (Hallowed Weight)        |
|-------------------|----------------------------|-------------------------------|
| Background        | `#0f0814` (quase preto)    | `#F7F4EF` (cream)             |
| Surface           | `#1b0f23` (purple escuro)  | `#FFFFFF`                     |
| Surface elevated  | `#291736`                  | `#FDFCFA`                     |
| Border            | `#2d1b3d` (purple)         | `#E8E3D9` (cream-stone)       |
| Border strong     | —                          | `#CFC8BB`                     |
| Text              | `#FFFFFF` (white)          | `#1A1612` (quase preto)       |
| Text secondary    | `slate-400` (#94a3b8)      | `#7A7060`                     |
| Text tertiary     | `slate-500`                | `#B0A898`                     |
| Brand primary     | `#4d0085` (purple)         | `#1A1612` (preto = primary)   |
| Brand accent      | `#ffbf00` (amber, abundante)| `#C4923A` (gold, escasso)    |
| Success           | tailwind `green-*`         | `#3D7A52` + `#E8F4ED` light   |
| Warning           | tailwind `yellow-*`        | `#B07030` + `#FBF0E2` light   |
| Danger            | tailwind `red-*`           | `#9B3A2E` + `#FBECEC` light   |
| Info              | tailwind `blue-*`          | `#2E628B` + `#E8F2FA` light   |

### Diagnóstico
**Inversão completa.** Não é só "mude para light mode" — é uma paleta com identidade própria (cream/stone/gold) que segue a regra **"gold used once where it must be used. No more."** A atual usa amber em botões primários, links, KPIs, hover states — abundante. O alvo reserva gold para CTAs editoriais ("Esqueceu a senha?", "Ver todas"), accent em event banner ativo, ícone de calendar no EventPill, status badge `ABERTO`, e progress bar do evento ativo. Em todo o resto, o **preto (#1A1612)** é o "primary" — botões principais, ícones, headings.

Severidade: **Crítica.** Toda variável CSS, todo `bg-*`, toda classe de cor precisa ser remapeada.

### Recomendações
- Reescrever `apps/web/tailwind.config.js` extends com a paleta nova (manter sintaxe shadcn `hsl(var(--*))` mas remapear valores em [index.css](apps/web/src/index.css)).
- Remover tokens Stitch (`surface-dark`, `surface-elevated`, `border-dark`, `background-dark`, `amber-accent`).
- Adicionar `gold`, `goldLight`, `goldMuted` + ramp success/warning/danger/info com `*-light` companions.
- **Auditar uso de gold pós-implementação:** se aparecer em mais de ~5 lugares por tela, está abundante.

---

## 4. Typography — 2/4

### Achados

| # | Atual                                                | Alvo                                                | Severidade |
|---|------------------------------------------------------|-----------------------------------------------------|------------|
| 1 | Família indeterminada (provavelmente system/Inter)   | **DM Sans** (300/400/500/600/700 + 400 italic)      | Alta       |
| 2 | `font-black` (900) em CTAs e headings                | Pesos 400-600 dominantes; 700 raríssimo             | Alta       |
| 3 | `tracking-wider` em badges                           | `letterSpacing: 0.02em` em badges; `0.1em` só em eyebrows uppercase | Média |
| 4 | Headings sem letter-spacing negativo                 | `letterSpacing: -0.02em` em h2/h3 (24-28px)         | Média      |
| 5 | Material Symbols já carregado (✓)                    | Confirmado — pode reaproveitar                      | —          |
| 6 | Escala: `text-xs/sm/base/lg/xl/2xl`                  | Escala explícita: 11/12/13/14/15/16/22/24/28        | Média      |
| 7 | Sem `tabular-nums`                                   | Valores monetários e contadores devem usar          | Média      |
| 8 | `text-2xl font-bold` para KPI value                  | `fontSize: 24, fontWeight: 600, lineHeight: 1`      | Baixa      |

### Diagnóstico
DM Sans não está carregada. A escala atual tailwind-padrão não casa com a do redesign (que usa fontes em px, não rem-step). Pesos atuais são pesados demais — alvo evita 700+ deliberadamente ("typography is thin and precise — a whisper").

### Recomendações
- Adicionar DM Sans em `apps/web/index.html` via `<link rel="preconnect">` + Google Fonts (já documentado em `Koinonia Design v2.html`).
- Definir tipografia em Tailwind extend: `fontFamily: { sans: ['DM Sans', 'system-ui', ...] }`.
- Banir `font-black` do projeto (ESLint rule opcional).
- Adicionar `font-feature-settings: 'tnum'` em containers de números (KPIs, valores monetários).

---

## 5. Spacing — 2/4

### Achados

| # | Atual                                       | Alvo                                            | Severidade |
|---|---------------------------------------------|-------------------------------------------------|------------|
| 1 | Main padding `p-8` (32px) com `max-w-[1400px]` | Main padding `28px` sem max-width arbitrária | Média      |
| 2 | Header `p-6` (24px)                         | Header altura fixa `56px` flex-shrink-0         | Média      |
| 3 | Sidebar `w-64` (256px) com `p-6`            | Sidebar discreta com `padding 18px 24px`        | Baixa      |
| 4 | Gaps: `gap-4/5/6/8` (16/20/24/32)           | Gaps modulares: `gap 6/8/10/12/14/16/24/28`     | Média      |
| 5 | Cards: `rounded-2xl p-6`                    | Cards: `borderRadius 12, padding 20`            | Alta       |
| 6 | Hero: `h-[280px]`                           | Event banner: `padding 28px 32px` sem altura fixa | Alta     |
| 7 | KPI grid: `gap-5`                           | KPI grid: `gap 14`                              | Baixa      |
| 8 | `space-y-8` entre seções                    | `marginBottom 24` entre seções                  | Baixa      |

### Diagnóstico
A UI atual respira mais (padding-8, gap-8). O alvo é **arquitetonicamente denso** — 28px main, 14-16px entre cards, padding interno 20px. Não é apertado: é proporcional ao peso visual menor (fonte mais leve, bordas mais finas, ouro escasso). Diferença de scale, não de inconsistência.

### Recomendações
- Criar tokens de spacing custom em Tailwind: `'card-pad': '20px', 'main-pad': '28px', 'header-h': '56px', 'sidebar-w': '232px'`.
- Substituir `rounded-xl/2xl` por classe customizada `rounded-card` (radius 12) e `rounded-btn` (radius 7).
- Auditar `max-w-[1400px]` — o alvo prefere `maxWidth: 1100` para conteúdo de dashboard, full-width para mapas.

---

## 6. Experience Design — 2/4

### Achados

| # | Atual                                                | Alvo                                                              | Severidade |
|---|------------------------------------------------------|-------------------------------------------------------------------|------------|
| 1 | Sem **Event Selector Screen** (escolha de evento global)| Tela dedicada pós-login com greeting + lista de eventos com progress | Crítica |
| 2 | Sem **EventPill** no header (switcher contextual)    | Pílula com nome+status+chevron, dropdown com troca rápida + "Novo evento" | Crítica |
| 3 | Selector de evento via `<select>` HTML em AcomodacoesPage | EventPill global no shell — toda tela respeita o evento ativo | Alta |
| 4 | Inscrição: assume modal/form único                   | Wizard multi-step com `SectionTitle` + steps (Identificação → Acomodação → Pagamento → Confirmação) | Alta |
| 5 | Login: amber CTA agressivo + photo backdrop          | Login two-column: left painel editorial (logo+pitch+features), right form discreto | Alta |
| 6 | Sem `Drawer` primitive                                | Drawer pattern para detalhes (header com close X, body, footer com actions) | Média |
| 7 | Sem `FilterTabs` unificado                            | FilterTabs como componente reutilizável (toggle entre views)      | Baixa |
| 8 | Sem QR code para check-in                             | QR code como pattern de inscrição confirmada/check-in              | Média |
| 9 | Estados vazios (empty states) ad-hoc                  | `EmptyState` primitive consistente                                | Baixa |
| 10| Loading states com `Loader2` lucide spin              | `Icon name="progress_activity"` Material Symbols com keyframes spin | Baixa |

### Diagnóstico
Os core CRUD flows funcionam (lista, form, detalhe). O que falta são os **patterns que dão identidade ao produto**: o ritual de selecionar o evento (Event Selector Screen), o controle contextual constante (EventPill), o wizard de inscrição com steps, o login editorial. São esses que comunicam "aqui você organiza um retiro" vs "aqui você usa um app de gestão".

### Recomendações
- Implementar Event Selector Screen como rota intermediária: `/login` → `/eventos/selecionar` → `/dashboard?eventoId=X`.
- Persistir `selectedEventoId` em URL search param + localStorage (TanStack Query já está cacheando).
- Implementar EventPill no `AppLayout` header consumindo o evento ativo.
- Migrar inscrição para wizard de 4 steps (já há `koinonia-page-eventos.jsx` referência no redesign).

---

## ━━━ Top 5 Fixes (priorizados) ━━━

1. **Reescrever paleta de cores** ([apps/web/tailwind.config.js](apps/web/tailwind.config.js) + [apps/web/src/index.css](apps/web/src/index.css)) — sem isso, todo o resto fica visualmente errado.
2. **Carregar DM Sans** + banir `font-black` em todo o projeto.
3. **Substituir `lucide-react` por Material Symbols** wrapper (`Icon` primitive) — afeta todas as páginas.
4. **Construir as 12 primitivas** do redesign (`Btn`, `Input`, `Card`, `Badge`, `Drawer`, `EventPill`, `EmptyState`, `FormField`, `SelectInput`, `TextArea`, `FilterTabs`, `SectionTitle`) em Tailwind — base para todas as páginas.
5. **Implementar EventPill + Event Selector Screen** — patterns-chave da nova IA.

---

## ━━━ Decisões Pendentes (BLOQUEIAM execução) ━━━

### D1: Arquitetura de estilo
O redesign usa **inline styles via objeto `C` + `Object.assign(window, ...)`**. O projeto atual usa **Tailwind + shadcn + CSS variables HSL**.

**Opções:**
- **A) Portar redesign para Tailwind tokens (recomendado)** — preserva ergonomia atual, mantém shadcn como base de Sheet/Dialog, troca apenas paleta+escala+primitivas. Effort: alto (12 primitivas novas), mas alinhado com stack.
- **B) Adotar inline styles do redesign** — fidelidade visual 100% imediata, mas quebra padrão do projeto e torna theming/dark-mode futuro impossível.
- **C) Híbrido** — primitivas customizadas em CSS Modules + Tailwind para layout. Não recomendado: dois sistemas.

**Recomendação: A.** Tailwind config aceita a paleta inteira como tokens semânticos (`bg-cream`, `text-ink`, `border-stone`, `accent-gold`).

### D2: Escopo de fases
O redesign cobre 4 páginas em mockup completo (login, eventos, acomodações, "main" = dashboard+participantes+inscrições+financeiro). A UI atual implementa todas + register. Caminho:

- **Fase A — Foundation:** tokens + tipografia + 12 primitivas + AppShell (Sidebar+Header+EventPill).
- **Fase B — Auth + Eventos:** Login + Event Selector Screen + Eventos page.
- **Fase C — Core pages:** Dashboard + Participantes + Inscrições (wizard) + Acomodações + Financeiro.

Isso pode caber em 1 fase grande ou 3 fases médias dependendo da preferência de granularidade.

---

## ━━━ Recomendação de sequência (não auto-executar) ━━━

```
1. /gsd-ui-phase   — produzir UI-SPEC.md a partir deste audit + arquivos de doc/Koinonia-redesign/
                     (locka decisão D1 + tokens + primitivas)
2. /gsd-plan-phase — wave breakdown (Foundation → Auth+Eventos → Core pages)
3. /gsd-execute-phase — execução com commits atômicos
```

**Não recomendo executar implementação sem UI-SPEC primeiro.** O escopo é uma **substituição de design system**, não um refinamento — locking via SPEC garante que a decisão D1 seja explícita e auditável.

---

## Arquivos de referência

- Filosofia: [doc/Koinonia-redesign/uploads/design-philosophy-hallowed-weight.md](doc/Koinonia-redesign/uploads/design-philosophy-hallowed-weight.md)
- Mockups HTML: [doc/Koinonia-redesign/Koinonia Design.html](doc/Koinonia-redesign/Koinonia Design.html), [doc/Koinonia-redesign/Koinonia Design v2.html](doc/Koinonia-redesign/Koinonia Design v2.html)
- Primitivas JSX: [doc/Koinonia-redesign/koinonia-primitives.jsx](doc/Koinonia-redesign/koinonia-primitives.jsx)
- Layout: [doc/Koinonia-redesign/koinonia-layout.jsx](doc/Koinonia-redesign/koinonia-layout.jsx)
- Páginas: [doc/Koinonia-redesign/koinonia-page-login.jsx](doc/Koinonia-redesign/koinonia-page-login.jsx), [doc/Koinonia-redesign/koinonia-page-eventos.jsx](doc/Koinonia-redesign/koinonia-page-eventos.jsx), [doc/Koinonia-redesign/koinonia-page-acomodacoes.jsx](doc/Koinonia-redesign/koinonia-page-acomodacoes.jsx), [doc/Koinonia-redesign/koinonia-pages-main.jsx](doc/Koinonia-redesign/koinonia-pages-main.jsx)
- Dados mock: [doc/Koinonia-redesign/koinonia-data.jsx](doc/Koinonia-redesign/koinonia-data.jsx)
