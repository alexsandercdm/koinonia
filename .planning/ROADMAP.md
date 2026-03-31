# Roadmap

## Phase 1: Core Foundation & Pessoas
**Goal:** Garantir que Auth (Better Auth) está 100% testado no novo Monolith Modular, e implementar gestão básica completa de participantes.
**Requirements:** AUTH-01, AUTH-02, PES-01, PES-02, PES-03, PES-04, PES-05.
- Confirmar estabilidade do BD e Auth via testes unit/E2E (tlc-spec-driven).
- Endpoints e páginas para cadastrar, listar, buscar e atualizar dados de pessoas e saúde.

## Phase 2: Core Business (Inscrições & Eventos)
**Goal:** Viabilizar a criação de eventos e o ciclo completo de registro de inscrições e pagamentos.
**Requirements:** INS-01, INS-02, INS-03, INS-04, INS-05, INS-06, INS-07.
- Estrutura de Eventos.
- Regra de controle e cálculo automático de pagamentos parciais e totais.

## Phase 3: Gestão Visual Cama-a-Cama
**Goal:** Resolver a limitação de gênero e limitação física das chácaras com mapa drag/drop ou modal de atribuição.
**Requirements:** ACO-01, ACO-02, ACO-03, ACO-04, ACO-05, ACO-06, ACO-07.
- Cadastro hierárquico: Local -> Quarto -> Cama.
- Atribuição transacional com validação cross-table de gênero.
- Exportar mapa em PDF.

## Phase 4: Observabilidade Financeira & Admin
**Goal:** Transparência de fluxo de caixa, despesa, break-even e auditoria das ações do sistema.
**Requirements:** FIN-01, FIN-02, FIN-03, FIN-04, ADM-01.
- Log de ações sensíveis (audit_log).
- Dashboards com métricas chave (TanStack Query/Recharts).
