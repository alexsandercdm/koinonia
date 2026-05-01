# Koinonia — Design: Evolução Multi-Tenant para SaaS de Igrejas

**Data:** 2026-05-01  
**Versão:** 2.0 (refinamento técnico aplicado)  
**Status:** Aprovado  
**Escopo:** v1.0 — Core multi-tenant (Organizations + RBAC + Events lifecycle + Internal registrations)

---

## 1. Contexto e Motivação

O Koinonia está na Phase 8 (Eventos CRUD UI) com backend completo (Phases 1–5) e frontend parcialmente funcional. O sistema atual é single-tenant — sem conceito de organização, sem hierarquia de papéis de domínio, sem isolamento de dados entre clientes.

O objetivo é evoluir para um SaaS multi-tenant aberto onde qualquer pastor pode criar sua organização (igreja), convidar membros e gerenciar eventos e inscrições — tudo isolado por organização.

**A evolução acontece antes do primeiro deploy** (não como v2 posterior) para evitar dívida técnica e retrabalho nas telas das Phases 9–11.

---

## 2. Decisões Tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Modelo de tenant | SaaS aberto — qualquer um cria sua org | Escalabilidade e independência por igreja |
| Estratégia de isolamento | Row-level isolation + FK compostas (+ RLS em v1.1) | 3 camadas de defesa; Drizzle compatível |
| RBAC | Better Auth Organizations + PermissionResolver customizado | Plugin cobre memberships/invites; hierarquia e visibilidade ficam na aplicação |
| Fonte do tenant | `activeOrganizationId` da sessão validada — nunca do header/body | Previne spoofing |
| Presidente | Owner da org, unicidade garantida por constraint parcial no banco | Sem modelo de rede/denominação em v1.0 |
| Onboarding | Self-service — quem cria a org vira Presidente | Slug escolhido pelo usuário no onboarding; presidência pode ser transferida atomicamente |
| Multi-org | Usuário pode ser membro de múltiplas orgs | Better Auth suporta nativamente; org "ativa" na sessão |
| Pessoa vs Usuário | Entidades separadas; papel definido no `member.role` do Better Auth | Pessoa existe sem login; user pode estar em múltiplas orgs |
| Hierarquia de pessoas | Adjacência simples (`lider_pessoa_id → pessoas.id`) + CTE recursiva | Simples de manter; PostgreSQL resolve subtree nativamente |
| Visibilidade de eventos | Org-wide para eventos publicados; rascunhos restritos a admins | Eventos são recurso da org, não da rede |
| E-mail de convite | Better Auth nativo com SMTP configurado | Sem sistema de e-mail próprio em v1.0 |
| RLS PostgreSQL | Adiado para v1.1 como ADR aberto | v1.0 usa BaseRepository + FK compostas como defesa suficiente |

---

## 3. Arquitetura

### 3.1 Segurança de Tenant — Fonte do `organization_id`

O design **nunca aceita `organization_id` do cliente** (header, query string ou body). A única fonte válida é a sessão validada pelo Better Auth no servidor.

```
Request chega com JWT (cookie ou Authorization header)
  → Better Auth valida token → devolve session
  → session.activeOrganizationId é o único orgId válido
  → TenantMiddleware lê APENAS session.activeOrganizationId
  → injeta ctx.orgId = session.activeOrganizationId
  → request sem activeOrganizationId → 401
  → X-Org-Id ou organizationId no header/body → ignorado silenciosamente + audit log
```

Para trocar de organização ativa, o cliente chama `POST /auth/organizations/set-active` (endpoint do Better Auth), que atualiza a sessão no servidor. A troca **nunca acontece via parâmetro de request**.

### 3.2 Isolamento de Dados — 3 Camadas

**Camada 1 — Application Guard (`BaseRepository`)**

```typescript
// Todo select inclui automaticamente:
.where(eq(table.organizationId, ctx.orgId))

// Todo insert inclui automaticamente:
{ organizationId: ctx.orgId, ...data }

// Guarda explícita em desenvolvimento e testes:
if (!ctx.orgId) throw new MissingTenantContextError()
```

**Camada 2 — FK Compostas no Banco**

O banco rejeita FK cross-tenant em nível de constraint, independente da aplicação:

```sql
-- inscricoes → eventos (mesma org obrigatória)
ALTER TABLE inscricoes
  ADD CONSTRAINT fk_inscricoes_evento
  FOREIGN KEY (organization_id, evento_id)
  REFERENCES eventos (organization_id, id);

-- inscricoes → pessoas (mesma org obrigatória)
ALTER TABLE inscricoes
  ADD CONSTRAINT fk_inscricoes_pessoa
  FOREIGN KEY (organization_id, pessoa_id)
  REFERENCES pessoas (organization_id, id);

-- Pré-requisito: índices unique compostos nas tabelas referenciadas
CREATE UNIQUE INDEX ON eventos (organization_id, id);
CREATE UNIQUE INDEX ON pessoas (organization_id, id);
CREATE UNIQUE INDEX ON locais (organization_id, id);
```

**Camada 3 — RLS PostgreSQL** *(adiado para v1.1)*

```sql
-- Estrutura preparada mas não ativada em v1.0
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON eventos
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### 3.3 Responsabilidades por Camada

**Better Auth** — gerencia:
- `organizations` (id, name, slug, plan)
- `members` (user_id, organization_id, role)
- `invitations` (email, org_id, role, expires_at)
- Sessões com `active_organization_id`

**TenantMiddleware** (Fastify plugin):
- Extrai `activeOrganizationId` da sessão Better Auth
- Injeta `ctx.orgId` e `ctx.userRole` em `request.context`
- Rejeita requisições sem org ativa (401)
- Loga tentativas de passar `organization_id` via header/body (audit)

**PermissionResolver** (função pura, sem dependência de infraestrutura):
- `canPerform(role: OrgRole, op: Operation): boolean`
- `canViewResource(role: OrgRole, scope: ResourceScope): boolean`
- Centraliza toda a lógica de autorização — nenhum use case toma decisão de permissão

**BaseRepository** (classe base Drizzle):
- Injeta `organization_id = ctx.orgId` em todo select/insert/update
- Lança `MissingTenantContextError` se `ctx.orgId` ausente

---

## 4. Modelagem de Domínio

### 4.1 Schema — Modificações

Tabelas que recebem `organization_id uuid NOT NULL REFERENCES organizations(id)`:

```sql
pessoas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  nome              text NOT NULL,
  genero            varchar(1) NOT NULL,
  data_nascimento   date,
  telefone          varchar(20),
  email             varchar(200),
  user_id           uuid REFERENCES users(id),        -- nullable: pessoa sem login
  lider_pessoa_id   uuid,                             -- FK composta abaixo
  alergias          text,
  restricoes_alimentares text[],
  medicamentos      text,
  condicoes_medicas text,
  contato_emergencia_nome varchar(200),
  contato_emergencia_tel  varchar(20),
  created_at        timestamp DEFAULT now(),
  updated_at        timestamp DEFAULT now(),
  deleted_at        timestamp,

  CONSTRAINT fk_lider_pessoa
    FOREIGN KEY (organization_id, lider_pessoa_id)
    REFERENCES pessoas (organization_id, id),        -- líder sempre da mesma org

  CONSTRAINT no_self_leadership
    CHECK (lider_pessoa_id <> id)                    -- previne auto-referência
)

eventos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  nome              varchar(200) NOT NULL,
  descricao         text,
  data_inicio       date NOT NULL,
  data_fim          date NOT NULL,
  local_id          uuid REFERENCES locais(id),
  capacidade_maxima integer NOT NULL,
  status            varchar(20) NOT NULL DEFAULT 'planejamento',
  -- status: planejamento | inscricoes_abertas | em_andamento | finalizado | cancelado
  created_at        timestamp DEFAULT now(),
  updated_at        timestamp DEFAULT now()
)

inscricoes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  evento_id         uuid NOT NULL,
  pessoa_id         uuid NOT NULL,
  -- FK compostas garantem que evento e pessoa são da mesma org:
  CONSTRAINT fk_inscricoes_evento
    FOREIGN KEY (organization_id, evento_id) REFERENCES eventos(organization_id, id),
  CONSTRAINT fk_inscricoes_pessoa
    FOREIGN KEY (organization_id, pessoa_id) REFERENCES pessoas(organization_id, id),
  papel             varchar(20) NOT NULL,   -- encontrista | servo
  valor_total       numeric(10,2) NOT NULL,
  status            varchar(20) NOT NULL DEFAULT 'PENDENTE',
  cama_id           uuid REFERENCES camas(id),
  observacoes       text,
  created_at        timestamp DEFAULT now(),
  updated_at        timestamp DEFAULT now()
)

locais (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  nome              varchar(200) NOT NULL,
  endereco          text,
  capacidade_total  integer,
  created_at        timestamp DEFAULT now(),
  updated_at        timestamp DEFAULT now()
)
```

**Tabelas que herdam isolamento via FK** (sem `organization_id` próprio):
- `quartos` — via `local_id → locais.organization_id`
- `camas` — via `quarto_id → quartos → locais.organization_id`
- `pagamentos` — via `inscricao_id → inscricoes.organization_id`
- `configuracao_evento` — via `evento_id → eventos.organization_id`
- `despesas` — via `evento_id → eventos.organization_id`

### 4.2 Índices obrigatórios

```sql
-- Unique compostos (pré-requisito para FK compostas)
CREATE UNIQUE INDEX ON eventos (organization_id, id);
CREATE UNIQUE INDEX ON pessoas (organization_id, id);
CREATE UNIQUE INDEX ON locais (organization_id, id);

-- Performance
CREATE INDEX ON pessoas (organization_id, lider_pessoa_id);
CREATE INDEX ON eventos (organization_id, status);
CREATE INDEX ON inscricoes (organization_id, evento_id);

-- Unicidade do PRESIDENTE por org
CREATE UNIQUE INDEX one_president_per_org
  ON members (organization_id)
  WHERE role = 'PRESIDENTE';
```

### 4.3 Vínculo Pessoa ↔ Usuário

- `pessoas.user_id` (nullable, FK global para `users.id`): preenchido quando a pessoa tem acesso ao sistema. Um usuário pode ser membro de múltiplas orgs — por isso a FK é global, sem `organization_id`.
- `pessoas.lider_pessoa_id` (nullable, FK composta): aponta para outra `pessoa` da **mesma org** — o líder direto na hierarquia. Usa FK composta `(organization_id, lider_pessoa_id) → pessoas(organization_id, id)` para o banco rejeitar cross-org.
- Uma pessoa sem `user_id` existe como cadastro e pode participar de eventos, mas não tem acesso ao sistema.
- Um membro do Better Auth com papel de liderança deve ter uma `pessoa` correspondente com `user_id` preenchido.
- Um usuário que é membro de múltiplas orgs tem uma `pessoa` separada em cada org — não existe "pessoa global" em v1.0.

### 4.4 Hierarquia de Rede — Adjacência + CTE Recursiva

Modelo de adjacência simples: cada `pessoa` tem um `lider_pessoa_id` apontando para o líder direto.

Para consultas de visibilidade (PASTOR_REDE, DISCIPULADOR), usa-se CTE recursiva do PostgreSQL:

```sql
WITH RECURSIVE rede AS (
  -- âncora: encontrar a pessoa que corresponde ao usuário atual
  SELECT p.id, p.lider_pessoa_id, 1 AS depth
  FROM pessoas p
  WHERE p.user_id = :current_user_id
    AND p.organization_id = :org_id

  UNION ALL

  -- recursão: todos os liderados diretos e indiretos
  SELECT p.id, p.lider_pessoa_id, r.depth + 1
  FROM pessoas p
  INNER JOIN rede r ON p.lider_pessoa_id = r.id
  WHERE p.organization_id = :org_id
    AND r.depth < 10  -- profundidade máxima: evita loops em dados corrompidos
)
SELECT * FROM pessoas
WHERE id IN (SELECT id FROM rede)
  AND organization_id = :org_id;
```

`PessoasRepository` encapsula isso em `findSubtree(pessoaId, orgId, maxDepth = 10)`.

---

## 5. RBAC — Hierarquia de Papéis

### 5.1 Separação Explícita: Visibilidade vs Permissão de Ação

**Visibilidade** = o que o papel enxerga nos dados.  
**Permissão** = o que o papel pode executar como ação.

Estes dois conceitos são implementados separadamente no `PermissionResolver`.

### 5.2 Visibilidade de Pessoas

| Papel | Pode ver |
|---|---|
| PRESIDENTE | Todas as pessoas da org |
| PASTOR_PRINCIPAL | Todas as pessoas da org |
| PASTOR_REDE | Subárvore recursiva (CTE a partir de sua `pessoa`) |
| DISCIPULADOR | Subárvore recursiva (CTE a partir de sua `pessoa`) |
| LIDER_CELULA | Apenas filhos diretos (`lider_pessoa_id = sua pessoa`, profundidade 1) |
| MEMBRO | Apenas a si mesmo |

### 5.3 Visibilidade de Eventos

Eventos são recursos org-wide, não da rede. A restrição é por status, não por hierarquia.

| Status do evento | Quem pode ver |
|---|---|
| `planejamento` (rascunho) | PRESIDENTE, PASTOR_PRINCIPAL |
| `inscricoes_abertas`, `em_andamento`, `finalizado`, `cancelado` | Todos os papéis |

### 5.4 Permissões de Ação

| Ação | PRESIDENTE | PASTOR_PRINCIPAL | PASTOR_REDE | DISCIPULADOR | LIDER_CELULA | MEMBRO |
|---|---|---|---|---|---|---|
| Criar evento | ✓ | ✓ | — | — | — | — |
| Editar evento | ✓ | ✓ | — | — | — | — |
| Transicionar status evento | ✓ | ✓ | — | — | — | — |
| Cancelar evento | ✓ | ✓ | — | — | — | — |
| Convidar membro | ✓ | ✓ | — | — | — | — |
| Alterar papel de membro | ✓ | ✓ (exceto PRESIDENTE) | — | — | — | — |
| Transferir presidência | ✓ | — | — | — | — | — |
| Cadastrar pessoa | ✓ | ✓ | ✓ | — | — | — |
| Editar pessoa | ✓ | ✓ | ✓ (sua subárvore) | ✓ (filhos diretos) | — | — |
| Inscrever outra pessoa | ✓ | ✓ | ✓ (sua subárvore) | ✓ (filhos diretos) | — | — |
| Se inscrever | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ver configurações da org | ✓ | ✓ | — | — | — | — |

### 5.5 Transferência de Presidência

Operação atômica — não existe estado intermediário com dois presidentes:

```sql
BEGIN;
  UPDATE members SET role = 'PASTOR_PRINCIPAL'
    WHERE organization_id = :org_id AND user_id = :current_president_id;
  UPDATE members SET role = 'PRESIDENTE'
    WHERE organization_id = :org_id AND user_id = :new_president_id;
COMMIT;
```

A constraint parcial `one_president_per_org` garante que o banco rejeita qualquer violação, mesmo que a transação seja implementada incorretamente.

---

## 6. Invariantes do Sistema

Regras que nunca podem ser violadas. Cada uma tem um teste de integração correspondente no CI.

| ID | Invariante |
|---|---|
| INV-01 | Toda query que acessa dado de tenant inclui `WHERE organization_id = ctx.orgId` |
| INV-02 | Nenhuma FK entre tabelas de tenant cruza `organization_id` (garantido por FK compostas) |
| INV-03 | `ctx.orgId` vem exclusivamente da sessão Better Auth validada no servidor |
| INV-04 | Existe exatamente 1 membro com `role = 'PRESIDENTE'` por organização |
| INV-05 | `lider_pessoa_id` aponta para pessoa da mesma organização (FK composta) |
| INV-06 | `lider_pessoa_id ≠ id` (sem auto-referência) |
| INV-07 | Eventos em `planejamento` são invisíveis para MEMBRO, LIDER_CELULA, DISCIPULADOR, PASTOR_REDE |
| INV-08 | `PermissionResolver` é a única fonte de lógica de autorização |
| INV-09 | `BaseRepository` lança `MissingTenantContextError` se instanciado sem `ctx.orgId` |
| INV-10 | Troca de org ativa requer `POST /auth/organizations/set-active` — não aceita orgId via parâmetro |

---

## 7. Módulos — v1.0 vs v1.1

### v1.0 — Core Multi-Tenant

| Módulo | Status | Entrega |
|---|---|---|
| Organizations | Novo | Criação self-service, convites, gestão de membros, org switcher |
| Auth + RBAC | Evolução | Hierarquia de 6 papéis, PermissionResolver, TenantMiddleware |
| Pessoas | Ajuste | +organization_id, +user_id, +lider_pessoa_id, visibilidade hierárquica com CTE |
| Eventos | Ajuste | +organization_id, ciclo de vida completo, guards por papel |
| Inscrições | Ajuste | +organization_id, FK compostas, fluxo existente mantido |
| Acomodações | Ajuste | +organization_id em locais, módulo existente mantido |

### v1.1 — Feature Expansion

| Módulo | Entrega |
|---|---|
| Financeiro por Evento | Receitas, despesas, indicadores, break-even |
| Equipes por Evento | Times de servos/líderes por papel |
| Formulário Público | Inscrição externa sem login, aprovação manual |
| Indicadores Gerais | Taxa de presença, crescimento de membros, histórico |
| RLS PostgreSQL | Terceira camada de isolamento (Camada 3) |

---

## 8. Roadmap de Execução

### Phase 8.5 — Multi-Tenant Foundation (inserir agora, antes de retomar Phase 8)

Ordem de implementação respeita dependências críticas: banco → auth → guards → endpoints → frontend → testes.

**Banco (etapas sequenciais):**
1. Migration etapa 1: adicionar `organization_id` nullable em `pessoas`, `eventos`, `inscricoes`, `locais`; adicionar `user_id` e `lider_pessoa_id` em `pessoas`
2. Script de backfill: criar org "default", atribuir `organization_id` a todos os registros existentes
3. Migration etapa 2: tornar `organization_id` NOT NULL; criar índices unique compostos
4. Migration etapa 3: adicionar FK compostas (`inscricoes↔eventos`, `inscricoes↔pessoas`, `pessoas↔pessoas` para `lider_pessoa_id`)
5. Migration etapa 4: constraint parcial `one_president_per_org`; CHECK `lider_pessoa_id <> id`

**Auth:**
6. Spike técnico: validar comportamento de `activeOrganizationId` no plugin Better Auth Organizations
7. Habilitar plugin Better Auth Organizations
8. Implementar `TenantMiddleware`: extrai orgId da sessão, nunca do header; inclui audit log

**Backend:**
9. `BaseRepository`: guard obrigatório de orgId + `MissingTenantContextError`
10. `PermissionResolver`: função pura com todos os papéis, operações e escopos de visibilidade
11. Refatorar todos os repositórios existentes para herdar `BaseRepository`
12. `PessoasRepository.findSubtree(pessoaId, orgId, maxDepth)`: CTE recursiva
13. `TransferPresidencyUseCase`: transação atômica com rollback
14. Endpoints de organização: create, update, get-members, invite, update-member-role, set-active
15. Atualizar todos os endpoints existentes para usar `ctx.orgId` via `TenantMiddleware`

**Frontend:**
16. `OrgContext`: expõe `activeOrgId` e `userRole` vindos da sessão
17. Migrar todas as query keys para `['org', orgId, resource, ...]`
18. Org switcher: chama `set-active` + `queryClient.clear()`
19. Onboarding: fluxo de criação de org para novo usuário (nome + slug escolhido pelo usuário)
20. Página de membros e convites

**Testes:**
21. Suite de isolamento cross-tenant (INV-01 a INV-10)
22. Suite de RBAC por papel e operação
23. Teste de transferência de presidência com rollback

**Bloqueios identificados:**
- Etapa 6 (spike Better Auth) deve rodar antes da etapa 8 — comportamento de `activeOrganizationId` precisa ser validado experimentalmente
- Etapa 3 depende de etapa 2 — `NOT NULL` sem backfill falha em dados existentes
- Etapa 4 depende de etapa 3 — FK compostas precisam dos índices unique

### Phase 8 — Eventos CRUD UI (retomar após 8.5)
- Completar EventosPage com org context
- Transições de status com validação
- Guards de papel por operação (criar/editar: PRESIDENTE e PASTOR_PRINCIPAL; ver publicados: todos)

### Phase 9 — Inscrições CRUD + Pagamentos UI
- Fluxo completo no contexto da org
- Registro de pagamentos, filtro de inadimplentes, cancelamento

### Phase 10 — Acomodações Polish + Offline Hardening
- Update otimista, export PDF, banner offline

### Phase 11 — Deploy v1.0 Multi-Tenant
- Build de produção, configuração de env, primeiro cliente real

---

## 9. Casos de Borda

| Caso | Tratamento |
|---|---|
| Usuário convidado sem `pessoa` vinculada | Válido — membro existe no Better Auth sem `pessoa`. Vínculo é opcional em v1.0. |
| Pessoa vira líder de si mesma | Bloqueado por `CHECK (lider_pessoa_id <> id)` |
| Ciclo de liderança (A lidera B, B lidera A) | CTE usa `depth < 10` como guarda; constraint de aplicação valida ao salvar |
| Org sem PRESIDENTE após transferência falhar | Constraint parcial + rollback transacional previnem estado inválido |
| Membro removido da org com pessoa vinculada | `pessoa` permanece — dados históricos (inscrições) são preservados |
| Evento cancelado com inscrições ativas | Transição para `cancelado` é permitida; inscrições precisam de ação manual para serem canceladas |
| Org switcher sem `queryClient.clear()` | Dados stale da org anterior aparecem em tela — mitigado por query keys com `orgId` |

---

## 10. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Vazamento cross-tenant por query sem guard | Alta | `BaseRepository` obrigatório + FK compostas + testes INV-01/INV-02 no CI |
| Spoofing de `organization_id` via header | Alta | TenantMiddleware usa exclusivamente sessão; header ignorado + audit log |
| Better Auth Organizations incompatível com hierarquia customizada | Média | Hierarquia fica no `PermissionResolver` da aplicação; spike técnico valida antes de commitar |
| Migration de dados existentes sem `organization_id` | Média | Migration em 2 etapas (nullable → backfill → NOT NULL); script idempotente |
| Cache cross-tenant no frontend | Média | Query keys incluem `orgId`; `queryClient.clear()` na troca de org |
| CTE recursiva com ciclo em dados corrompidos | Média | `depth < 10` na CTE; `CHECK (lider_pessoa_id <> id)` no banco |
| FK compostas não suportadas via Drizzle DSL | Baixa | Criar via SQL raw na migration (Drizzle suporta `sql` literal em migrations) |
| Constraint parcial `WHERE role = 'PRESIDENTE'` não suportada via Drizzle DSL | Baixa | Criar via SQL raw na migration |
| Performance sem índices compostos | Baixa | Índices criados na própria migration da Phase 8.5 |

---

## 11. Suposições

- Pessoa sem `user_id` pode ter inscrições e participar de eventos — gerenciada por um líder com acesso ao sistema.
- Um usuário membro de múltiplas orgs tem uma `pessoa` separada em cada org — sem "pessoa global" em v1.0.
- Remover um membro não deleta a `pessoa` da org — dados históricos são preservados.
- O `member.role` do Better Auth é a fonte de verdade do papel — sem tabela de roles duplicada no domínio.
- RLS PostgreSQL não será implementado em v1.0 — risco aceito conscientemente, com mitigação via `MissingTenantContextError` + testes de isolamento obrigatórios no CI.
