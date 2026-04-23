# Roadmap

---

## Milestone v1.0 — Backend Core (Phases 1–5) ✓ Completed

## Phase 1: Core Foundation & Pessoas ✓
**Goal:** Garantir que Auth (Better Auth) está 100% testado no novo Monolith Modular, e implementar gestão básica completa de participantes.
**Requirements:** AUTH-01, AUTH-02, PES-01, PES-02, PES-03, PES-04, PES-05.
- Confirmar estabilidade do BD e Auth via testes unit/E2E (tlc-spec-driven).
- Endpoints e páginas para cadastrar, listar, buscar e atualizar dados de pessoas e saúde.

## Phase 2: Core Business (Inscrições & Eventos) ✓
**Goal:** Viabilizar a criação de eventos e o ciclo completo de registro de inscrições e pagamentos.
**Requirements:** INS-01, INS-02, INS-03, INS-04, INS-05, INS-06, INS-07.
- Estrutura de Eventos.
- Regra de controle e cálculo automático de pagamentos parciais e totais.

## Phase 3: Gestão Visual Cama-a-Cama ✓
**Goal:** Resolver a limitação de gênero e limitação física das chácaras com mapa drag/drop ou modal de atribuição.
**Requirements:** ACO-01, ACO-02, ACO-03, ACO-04, ACO-05, ACO-06.
- Cadastro hierárquico: Local → Quarto → Cama.
- Atribuição transacional com validação cross-table de gênero.

## Phase 4: Observabilidade Financeira & Admin ✓
**Goal:** Transparência de fluxo de caixa, despesa, break-even e auditoria das ações do sistema.
**Requirements:** FIN-01, FIN-02, FIN-03, FIN-04, ADM-01.
- Log de ações sensíveis (audit_log).
- Dashboards com métricas chave (TanStack Query/Recharts).

## Phase 5: Fase 0 Frontend — Redesign & Scaffold ✓
**Goal:** Redesign visual completo do frontend seguindo protótipos Stitch e criação de páginas shell com navegação ativa.
**Requirements:** (UI scaffolding — pre-v1.1)
- Todas as rotas principais navegáveis no dashboard.
- Design system aplicado (dark mode, violet #4d0085, Inter, 48px touch targets).

---

## Milestone v1.1 — Frontend Funcional & Primeiro Deploy (Phases 6–11)

## Phase 6: Infrastructure Foundation
**Goal:** Corrigir as falhas de infraestrutura críticas que bloqueiam todas as telas de feature antes de começar qualquer UI de CRUD.
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05.
**Depends on:** Phase 5.
**Plans:** 3 plans
**Success criteria:**
1. `apiFetch` lança `ApiError` com `.status` numérico — `onError` consegue distinguir 409 de 400.
2. `persistQueryClient` ativo — dados sobrevivem a navegação com WiFi desconectado por 24h.
3. `GET /eventos/:id/inscricoes` retorna 200 com lista de inscrições no Postman/Thunder Client.
4. `StatusEventoEnum` e coerção de `valor_total` alinhados entre shared Zod e rotas Fastify.
5. `npm install` completo sem conflitos — todos os 11 pacotes disponíveis no projeto web.

Plans:
- [ ] 06-01-PLAN.md — Install 11 packages + ApiError class in apiFetch (INFRA-05, INFRA-01)
- [ ] 06-02-PLAN.md — Backend route GET /eventos/:id/inscricoes + Zod schema drifts (INFRA-03, INFRA-04)
- [ ] 06-03-PLAN.md — persistQueryClient with localStorage persister and session exclusion (INFRA-02)

## Phase 7: Participantes CRUD UI
**Goal:** Conectar ParticipantsPage ao backend com CRUD completo — listar, buscar, criar, editar e inativar participantes.
**Requirements:** UI-PES-01, UI-PES-02, UI-PES-03, UI-PES-04.
**Depends on:** Phase 6.
**Process:** Aplicar `/ui-ux-pro-max` para design das telas antes da codificação.
**Success criteria:**
1. Usuário busca "João" e vê resultado filtrado instantâneo (dados do cache, sem nova requisição se offline).
2. Usuário cria participante preenchendo 3 abas (Dados / Saúde / Emergência) — registro aparece na lista.
3. Usuário edita alergias de um participante — campo atualizado persiste após reload da página.
4. Usuário inativa participante — sumirá da lista ativa mas permanece em histórico de inscrições.
5. Formulário exibe erro inline por campo sem necessidade de submit (validação on blur).

## Phase 8: Eventos CRUD UI
**Goal:** Criar EventosPage com listagem, criação e edição de eventos — rota `/eventos` acessível via navegação.
**Requirements:** UI-EVT-01, UI-EVT-02.
**Depends on:** Phase 6.
**Process:** Aplicar `/ui-ux-pro-max` para design (Event list card e Event form sheet — sem protótipo Stitch).
**Success criteria:**
1. Usuário acessa `/eventos` via sidebar — lista exibe nome, datas, local, capacidade e status colorido.
2. Usuário cria evento com datas via date picker — evento aparece na lista com "Aberto" e "0/N vagas ocupadas".
3. Usuário edita evento existente — alterações refletem imediatamente na listagem.
4. Barra de capacidade muda de cor verde → amarelo → vermelho conforme ocupação aumenta.
5. Evento encerrado (data passada) exibe badge "Encerrado" e não aceita novas inscrições.

## Phase 9: Inscrições CRUD + Pagamentos UI
**Goal:** Implementar o fluxo completo de inscrições — inscrever participante em evento, registrar pagamentos e gerenciar inadimplência.
**Requirements:** UI-INS-01, UI-INS-02, UI-INS-03, UI-INS-04, UI-INS-05.
**Depends on:** Phase 7, Phase 8.
**Process:** Aplicar `/ui-ux-pro-max` para design (Inscription list, Payment modal, Inadimplency view — sem protótipo Stitch).
**Success criteria:**
1. Usuário seleciona evento → vê lista de inscritos com badge colorido: verde (Pago Total), amarelo (Pago Parcial), vermelho (Pendente).
2. Usuário inscreve participante em evento escolhendo papel (Encontrista/Servo) e valor — inscrito aparece na lista como Pendente.
3. Usuário registra pagamento de R$50 em inscrição de R$150 — status muda para "Pago Parcial", saldo exibe R$100.
4. Filtro "Inadimplentes" mostra apenas inscrições com saldo > 0.
5. Usuário cancela inscrição com nota de estorno — inscrição muda para "Cancelada" e pagamentos ficam registrados no histórico.

## Phase 10: Acomodações Polish + Offline Hardening
**Goal:** Finalizar o módulo de acomodações com update otimista, export PDF e hardening para uso offline no local do retiro.
**Requirements:** UI-ACO-01, UI-ACO-02, UI-ACO-03.
**Depends on:** Phase 6.
**Success criteria:**
1. Usuário atribui cama — cama muda de cor imediatamente (antes da resposta do servidor).
2. Conflito 409 (cama já atribuída por outro usuário) → rollback visual instantâneo + toast "Cama já ocupada".
3. Lista "Sem cama" remove participante imediatamente após atribuição (sem ghost entries).
4. Usuário exporta PDF do mapa de quartos — arquivo gerado em < 5s, mostra ocupação por nome/quarto/cama.
5. Banner "Sem conexão" aparece quando offline — mutations ficam pendentes e disparam ao reconectar.

## Phase 11: Deploy para Teste com Usuários
**Goal:** Colocar a aplicação em ambiente de produção acessível para o primeiro teste real com organizadores do retiro.
**Requirements:** DEPLOY-01, DEPLOY-02.
**Depends on:** Phase 6, Phase 7, Phase 8, Phase 9, Phase 10.
**Success criteria:**
1. Build de produção gera artefatos sem erros TypeScript críticos.
2. Variáveis de ambiente de produção (DATABASE_URL, BETTER_AUTH_SECRET, CORS) configuradas e documentadas.
3. API responde em URL pública — endpoint `/health` retorna 200.
4. Frontend carregado via HTTPS — login funciona e dashboard exibe dados reais.
5. Pelo menos 1 organizador consegue cadastrar participante + evento + inscrição + pagamento sem intervenção técnica.

---

## Coverage Validation

| REQ-ID | Phase | Description |
|--------|-------|-------------|
| INFRA-01 | Phase 6 | ApiError com status code |
| INFRA-02 | Phase 6 | Cache persistence localStorage |
| INFRA-03 | Phase 6 | GET /eventos/:id/inscricoes backend route |
| INFRA-04 | Phase 6 | Zod schema drift resolution |
| INFRA-05 | Phase 6 | 11 packages installed |
| UI-PES-01 | Phase 7 | Participant list + search |
| UI-PES-02 | Phase 7 | Participant create/edit form |
| UI-PES-03 | Phase 7 | Participant event history |
| UI-PES-04 | Phase 7 | Participant soft-delete |
| UI-EVT-01 | Phase 8 | Event list + status + capacity |
| UI-EVT-02 | Phase 8 | Event create/edit form |
| UI-INS-01 | Phase 9 | Enroll participant in event |
| UI-INS-02 | Phase 9 | Inscription list per event |
| UI-INS-03 | Phase 9 | Register payment |
| UI-INS-04 | Phase 9 | Inadimplency filter |
| UI-INS-05 | Phase 9 | Cancel inscription |
| UI-ACO-01 | Phase 10 | Optimistic bed assignment |
| UI-ACO-02 | Phase 10 | Stale key fix |
| UI-ACO-03 | Phase 10 | PDF export |
| DEPLOY-01 | Phase 11 | Production build + env config |
| DEPLOY-02 | Phase 11 | Live deploy for user testing |

**Total:** 21 requirements → 6 phases → 100% coverage ✓
