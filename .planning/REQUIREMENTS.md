# Requirements

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: Usuários (Admin/Líder/Servo) podem fazer login e logout com Better Auth (self-hosted).
- [ ] **AUTH-02**: Rotas de API e frontend protegidas baseadas na role do usuário (RLS no BD e Middleware no Fastify).

### Gestão de Pessoas
- [ ] **PES-01**: Cadastrar participante com dados pessoais, de saúde e contato de emergência.
- [ ] **PES-02**: Buscar participante por nome, telefone ou padrinho (autocomplete).
- [ ] **PES-03**: Visualizar histórico de eventos de um participante.
- [ ] **PES-04**: Editar dados de saúde (alergias, medicamentos) com registro de log.
- [ ] **PES-05**: Soft-delete de participante preservando histórico de inscrições.

### Inscrições e Eventos
- [ ] **INS-01**: Criar e gerenciar eventos com período, local e capacidade máxima.
- [ ] **INS-02**: Inscrever participante em evento como 'Encontrista' ou 'Servo'.
- [ ] **INS-03**: Definir valor de inscrição por papel e evento.
- [ ] **INS-04**: Registrar pagamentos parciais com forma de pagamento e comprovante.
- [ ] **INS-05**: Calcular automaticamente status: Pendente / Pago Parcial / Pago Total.
- [ ] **INS-06**: Emitir lista de inadimplentes para o líder.
- [ ] **INS-07**: Cancelar inscrição com estorno registrado em pagamentos.

### Acomodação Cama-a-Cama
- [ ] **ACO-01**: Cadastrar locais (chácaras) com nome, endereço e capacidade.
- [ ] **ACO-02**: Cadastrar quartos com regras de gênero (M/F/Misto) e limite de capacidade.
- [ ] **ACO-03**: Cadastrar camas com identificação e tipo (solteiro, beliche).
- [ ] **ACO-04**: Visualizar mapa de acomodação (disponível/ocupado/bloqueado).
- [ ] **ACO-05**: Atribuir inscrito a uma cama com validação estrita de gênero e lock otimista.
- [ ] **ACO-06**: Liberar atribuição de cama sem cancelar inscrição.
- [ ] **ACO-07**: Exportar mapa de quartos em PDF para uso offline.

### Financeiro e Administração
- [ ] **FIN-01**: Dashboard financeiro: Previsto vs Arrecadado vs Despesas.
- [ ] **FIN-02**: Calcular ponto de equilíbrio do evento (break-even).
- [ ] **FIN-03**: Registrar despesas categorizadas com upload de comprovantes (Storage).
- [ ] **FIN-04**: Relatório de fluxo de caixa exportável em CSV/PDF.
- [ ] **ADM-01**: Log de auditoria para operações sensíveis.

## Phase 2 & 3 / Out of Scope

As seguintes funcionalidades foram listadas na documentação original para o futuro, sendo mantidas fora do MVP atual (Fase 1):

- Check-in QR Code no evento via mobile.
- App Mobile Nativo.
- Notificações Push SMS/E-mail.
- Geração de PDF do Crachá com QR Code.
- Relatórios Pós-Encontro e Portal do Encontrista Público.
