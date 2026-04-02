# Phase 02: Core Business (Inscricoes & Eventos) - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a base backend do ciclo de eventos e inscricoes do MVP: criacao e consulta de eventos, configuracao de valores por papel, registro de inscricoes, controle de capacidade com lista de espera, registro de pagamentos parciais, recalculo automatico de status financeiro, lista de inadimplentes e cancelamento com estorno registrado.

Esta fase consolida o fluxo transacional de inscricoes e pagamentos. Atribuicao cama-a-cama, dashboards financeiros, relatorios exportaveis e experiencias frontend mais amplas ficam fora deste recorte.

</domain>

<decisions>
## Implementation Decisions

### Auto-selected decisions
- **D-01:** `[auto]` Priorizar backend/API e persistencia antes de qualquer aprofundamento de UI, porque os requisitos `INS-01` a `INS-07` dependem de regras de negocio e integridade de dados.
- **D-02:** `[auto]` Manter a fase orientada ao modulo `inscricoes`, reutilizando `pessoas` e `auth` ja existentes, em vez de criar um bounded context separado.

### Event lifecycle and pricing
- **D-03:** `[auto]` O evento deve suportar configuracoes de preco por papel (`encontrista` e `servo`) associadas ao proprio evento.
- **D-04:** `[auto]` O status inicial do evento permanece operacionalmente simples (`rascunho` no codigo atual), com gerenciamento detalhado do ciclo de vida podendo evoluir depois sem bloquear o MVP.
- **D-05:** `[auto]` O preco da inscricao deve ser congelado no momento do registro em `valor_total`, mesmo que a configuracao do evento mude depois.

### Registration and capacity behavior
- **D-06:** `[auto]` A inscricao deve depender de `evento_id`, `pessoa_id` e `papel`, aproveitando o cadastro de participantes da fase 1.
- **D-07:** `[auto]` Quando a capacidade maxima do evento for atingida, novas inscricoes entram em `LISTA_ESPERA` em vez de falhar.
- **D-08:** `[auto]` Observacoes livres da inscricao sao opcionais e fazem parte do fluxo MVP.

### Payments and financial status
- **D-09:** `[auto]` Pagamentos devem ser registrados como lancamentos independentes para permitir parcelamento e estorno.
- **D-10:** `[auto]` O status financeiro da inscricao deve ser recalculado automaticamente a partir do total pago versus `valor_total`, com os estados `PENDENTE`, `PAGO_PARCIAL` e `PAGO_TOTAL`.
- **D-11:** `[auto]` Cancelamento deve preservar historico financeiro e registrar eventual estorno como novo pagamento com valor negativo ou forma de estorno equivalente ao fluxo existente.
- **D-12:** `[auto]` `LISTA_ESPERA` e `CANCELADA` nao entram no calculo de inadimplencia operacional.

### Access and operational scope
- **D-13:** `[auto]` Criacao de eventos fica restrita a `admin`; operacoes de inscricao, pagamentos, inadimplencia, substituicao e cancelamento ficam com `lider`.
- **D-14:** `[auto]` Upload/armazenamento real de comprovante nao precisa ser fechado nesta fase; basta suportar referencia `comprovante_url` no modelo e na API.

### the agent's Discretion
- Normalizacao futura de enums do banco versus strings literais existentes.
- Regras adicionais de unicidade da inscricao por pessoa/evento, caso os testes ou requisitos detalhados exijam endurecimento.
- Granularidade de validacoes de datas e transicoes de status do evento.

</decisions>

<specifics>
## Specific Ideas

- O fluxo de referencia atual no repositorio cobre: criar evento com configuracoes, registrar inscricao, aplicar pagamento parcial, fechar pagamento total, substituir participante, cancelar inscricao e consultar inadimplentes.
- O schema atual ja aponta para uma linha de continuidade entre fases 2 e 3 ao permitir `cama_id` opcional na inscricao, sem tornar acomodacao obrigatoria agora.
- O projeto ja assume um monolito modular com Fastify + Drizzle + Better Auth; a fase deve seguir esse padrao.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product scope
- `.planning/ROADMAP.md` — define o objetivo e os requisitos macro da fase 2.
- `.planning/REQUIREMENTS.md` — requisitos `INS-01` a `INS-07` do MVP.
- `.planning/STATE.md` — foco atual do projeto e obrigatoriedade de seguir o fluxo `tlc-spec-driven`.

### Backend contracts and persistence
- `apps/api/src/db/schema.ts` — tabelas, relacoes e tipos atuais de eventos, inscricoes, pagamentos e despesas.
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — contratos HTTP e regras de autorizacao do modulo.
- `apps/api/src/modules/inscricoes/usecases/CreateEventoUseCase.ts` — criacao de evento com configuracoes de preco por papel.
- `apps/api/src/modules/inscricoes/usecases/RegisterInscricaoUseCase.ts` — regra de precificacao e lista de espera no registro.
- `apps/api/src/modules/inscricoes/usecases/RecordPagamentoUseCase.ts` — recalculo automatico do status financeiro.
- `apps/api/src/modules/inscricoes/usecases/CancelInscricaoUseCase.ts` — cancelamento e estorno.
- `apps/api/src/modules/inscricoes/usecases/GetInadimplentesUseCase.ts` — visao operacional de inadimplencia.

### Verification baseline
- `apps/api/src/tests/inscricoes-e2e.test.ts` — fluxo E2E principal que exercita os casos centrais da fase.
- `.planning/phases/02-core-business-inscricoes/02-01-inscricoes-schema-PLAN.md` — plano inicial existente, hoje incompleto em relacao ao estado real do codigo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/api/src/modules/inscricoes/repositories/EventoRepository.ts`: encapsula leitura e escrita de eventos e configuracoes.
- `apps/api/src/modules/inscricoes/repositories/InscricaoRepository.ts`: concentra persistencia e consultas de inscricoes.
- `apps/api/src/modules/inscricoes/repositories/PagamentoRepository.ts`: registra pagamentos e calcula somatorios por inscricao.
- `apps/api/src/tests/helpers/setupTestDB.ts`: limpeza de tabelas para testes integrados/E2E.

### Established Patterns
- O backend usa casos de uso por operacao, controllers finos e repositories com Drizzle.
- Autorizacao e separada por middleware/role no Fastify, nao embutida nos casos de uso.
- Testes E2E usam `buildApp()` + `app.inject()` e seed manual de usuarios/pessoas.

### Integration Points
- O modulo `inscricoes` depende de `pessoas` para o participante inscrito.
- O modulo depende de `auth` para roles e para o registro do usuario que opera pagamentos/estornos.
- A fase 3 consome `inscricoes.cama_id`; por isso esse campo deve continuar opcional nesta fase.

</code_context>

<deferred>
## Deferred Ideas

- Promocao automatica de lista de espera quando houver cancelamento.
- Upload real de comprovantes em storage.
- CRUD/frontend administrativo completo de eventos e inscricoes.
- Regras avancadas de fechamento/encerramento de evento.

</deferred>

---

*Phase: 02-core-business-inscricoes*
*Context gathered: 2026-04-01*
