# Requirements

## v1 Requirements (Milestone v1.0 — Backend Core)

### Authentication
- [x] **AUTH-01**: Usuários (Admin/Líder/Servo) podem fazer login e logout com Better Auth (self-hosted). ✓ Phase 1
- [x] **AUTH-02**: Rotas de API e frontend protegidas baseadas na role do usuário (RLS no BD e Middleware no Fastify). ✓ Phase 1

### Gestão de Pessoas
- [x] **PES-01**: Cadastrar participante com dados pessoais, de saúde e contato de emergência. ✓ Phase 1
- [x] **PES-02**: Buscar participante por nome, telefone ou padrinho (autocomplete). ✓ Phase 1
- [x] **PES-03**: Visualizar histórico de eventos de um participante. ✓ Phase 1
- [x] **PES-04**: Editar dados de saúde (alergias, medicamentos) com registro de log. ✓ Phase 1
- [x] **PES-05**: Soft-delete de participante preservando histórico de inscrições. ✓ Phase 1

### Inscrições e Eventos
- [x] **INS-01**: Criar e gerenciar eventos com período, local e capacidade máxima. ✓ Phase 2
- [x] **INS-02**: Inscrever participante em evento como 'Encontrista' ou 'Servo'. ✓ Phase 2
- [x] **INS-03**: Definir valor de inscrição por papel e evento. ✓ Phase 2
- [x] **INS-04**: Registrar pagamentos parciais com forma de pagamento. ✓ Phase 2
- [x] **INS-05**: Calcular automaticamente status: Pendente / Pago Parcial / Pago Total. ✓ Phase 2
- [x] **INS-06**: Emitir lista de inadimplentes para o líder. ✓ Phase 2
- [x] **INS-07**: Cancelar inscrição com estorno registrado em pagamentos. ✓ Phase 2

### Acomodação Cama-a-Cama
- [x] **ACO-01**: Cadastrar locais (chácaras) com nome, endereço e capacidade. ✓ Phase 3
- [x] **ACO-02**: Cadastrar quartos com regras de gênero (M/F/Misto) e limite de capacidade. ✓ Phase 3
- [x] **ACO-03**: Cadastrar camas com identificação e tipo (solteiro, beliche). ✓ Phase 3
- [x] **ACO-04**: Visualizar mapa de acomodação (disponível/ocupado/bloqueado). ✓ Phase 3
- [x] **ACO-05**: Atribuir inscrito a uma cama com validação estrita de gênero e lock otimista. ✓ Phase 3
- [x] **ACO-06**: Liberar atribuição de cama sem cancelar inscrição. ✓ Phase 3

### Financeiro e Administração
- [x] **FIN-01**: Dashboard financeiro: Previsto vs Arrecadado vs Despesas. ✓ Phase 4
- [x] **FIN-02**: Calcular ponto de equilíbrio do evento (break-even). ✓ Phase 4
- [x] **FIN-03**: Registrar despesas categorizadas com upload de comprovantes (Storage). ✓ Phase 4
- [x] **FIN-04**: Relatório de fluxo de caixa exportável em CSV/PDF. ✓ Phase 4
- [x] **ADM-01**: Log de auditoria para operações sensíveis. ✓ Phase 4

---

## v1.1 Requirements (Milestone v1.1 — Frontend Funcional & Primeiro Deploy)

### Infrastructure Foundation
- [ ] **INFRA-01**: `apiFetch` expõe status HTTP via `ApiError` — `onError` pode distinguir 400/409/422.
- [ ] **INFRA-02**: Cache TanStack Query persistido em localStorage (gcTime 24h) para offline grace em WiFi instável.
- [ ] **INFRA-03**: Endpoint `GET /eventos/:id/inscricoes` existe no backend e retorna inscrições do evento.
- [ ] **INFRA-04**: Schemas Zod alinhados com rotas backend — `StatusEventoEnum` e coerção de `valor_total` corretos.
- [ ] **INFRA-05**: 11 pacotes instalados (react-day-picker, react-imask, react-dropzone, Radix primitives, persist-client).

### Gestão de Participantes (UI)
- [ ] **UI-PES-01**: Usuário pode listar e buscar participantes por nome, telefone ou padrinho (funciona offline via cache).
- [ ] **UI-PES-02**: Usuário pode criar/editar participante com formulário completo (dados pessoais + saúde + emergência em 3 abas).
- [ ] **UI-PES-03**: Usuário pode visualizar histórico de eventos de um participante.
- [ ] **UI-PES-04**: Usuário pode inativar participante (soft-delete, histórico preservado).

### Gestão de Eventos (UI)
- [ ] **UI-EVT-01**: Usuário pode listar eventos com indicador de status (Aberto/Em andamento/Encerrado) e barra de capacidade.
- [ ] **UI-EVT-02**: Usuário pode criar/editar evento (nome, datas, local, capacidade máxima).

### Fluxo de Inscrições (UI)
- [ ] **UI-INS-01**: Usuário pode inscrever participante em evento (selecionar participante + papel + valor).
- [ ] **UI-INS-02**: Usuário pode ver lista de inscritos por evento com status de pagamento colorido.
- [ ] **UI-INS-03**: Usuário pode registrar pagamento parcial ou total (valor, método, nota opcional).
- [ ] **UI-INS-04**: Usuário pode filtrar lista de inadimplentes (saldo devedor > 0).
- [ ] **UI-INS-05**: Usuário pode cancelar inscrição com registro de estorno.

### Acomodações — Polish (UI)
- [ ] **UI-ACO-01**: Atribuição de cama usa update otimista com rollback visual em conflito 409.
- [ ] **UI-ACO-02**: Lista "sem cama" atualiza corretamente após atribuição (stale key fix).
- [ ] **UI-ACO-03**: Usuário pode exportar mapa de quartos em PDF para uso offline no local do retiro.

### Deploy para Teste com Usuários
- [ ] **DEPLOY-01**: Aplicação configurada com variáveis de ambiente de produção e build otimizado.
- [ ] **DEPLOY-02**: Deploy funcional em ambiente acessível por usuários de teste (plataforma a definir na fase).

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| INFRA-01 to INFRA-05 | Phase 6 | — |
| UI-PES-01 to UI-PES-04 | Phase 7 | — |
| UI-EVT-01 to UI-EVT-02 | Phase 8 | — |
| UI-INS-01 to UI-INS-05 | Phase 9 | — |
| UI-ACO-01 to UI-ACO-03 | Phase 10 | — |
| DEPLOY-01 to DEPLOY-02 | Phase 11 | — |

## Out of Scope

### v1.1 Out of Scope (deferred to v1.2+)
- Upload de comprovante de pagamento (foto/PDF) — requer endpoint de storage no backend.
- RBAC frontend por role — proteção está no backend; UI unificada para v1 test.
- Testes E2E automatizados — validação manual no teste com usuários.
- Relatório financeiro CSV/PDF (FIN-04) — dashboard já mostra dados, export é next.

### Fora do MVP (v1.0 e v1.1)
- Check-in QR Code no evento via mobile.
- App Mobile Nativo.
- Notificações Push SMS/E-mail.
- Geração de PDF do Crachá com QR Code.
- Relatórios Pós-Encontro e Portal do Encontrista Público.
- ACO-07 was previously out of scope — moved to v1.1 per user decision 2026-04-22.
