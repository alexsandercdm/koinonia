# Koinonia — Design: Evolução Multi-Tenant para SaaS de Igrejas

**Data:** 2026-05-01  
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
| Estratégia de isolamento | Row-level isolation (organization_id) | Padrão de mercado, compatível com Drizzle ORM |
| RBAC | Better Auth Organizations + PermissionResolver customizado | Plugin nativo cobre memberships/invites; hierarquia fica na aplicação |
| Presidente | Owner da org (sem cross-org) | Sem modelo de rede/denominação em v1.0 |
| Onboarding | Self-service — quem cria a org vira Presidente | Presidência pode ser transferida para outro membro |
| Multi-org | Usuário pode ser membro de múltiplas orgs | Better Auth suporta nativamente; org "ativa" na sessão |
| Pessoa vs Usuário | Entidades separadas | Pessoa existe sem login; cargo definido no `member.role` |
| Visibilidade do Pastor de Rede | Apenas pessoas linkadas explicitamente | Vínculo via `lider_id` na tabela `pessoas` |

---

## 3. Arquitetura

### 3.1 Fluxo de Requisição

```
Browser/App
  → JWT + organization_id no header
  → Better Auth (valida sessão, resolve user_id + active_org_id + role)
  → TenantMiddleware Fastify (injeta ctx.orgId + ctx.userRole)
  → PermissionResolver (verifica se role tem acesso à operação)
  → Controller → Use Case
  → BaseRepository (toda query inclui WHERE organization_id = ctx.orgId)
  → PostgreSQL
```

### 3.2 Responsabilidades por Camada

**Better Auth** — gerencia:
- `organizations` (id, name, slug, plan)
- `members` (user_id, organization_id, role)
- `invitations` (email, org_id, role, expires_at)
- Sessões com `active_organization_id`

**TenantMiddleware** (Fastify plugin) — responsável por:
- Extrair `active_organization_id` da sessão Better Auth
- Injetar `ctx.orgId` e `ctx.userRole` em `request.context`
- Rejeitar requisições sem org ativa (401)

**PermissionResolver** (serviço da aplicação) — responsável por:
- Mapear operação (ex: `eventos:create`) para papéis permitidos
- Verificar se `ctx.userRole` está autorizado
- Centralizar toda a lógica de permissão — nenhum use case toma decisão de autorização

**BaseRepository** (classe base Drizzle) — responsável por:
- Injetar `organization_id = ctx.orgId` automaticamente em todo select/insert/update
- Prevenir queries sem escopo de org

---

## 4. Modelagem de Domínio

### 4.1 Schema — Modificações nas tabelas existentes

Todas as tabelas a seguir recebem `organization_id uuid NOT NULL REFERENCES organizations(id)`:

```
pessoas          + organization_id
                 + user_id (nullable → FK para users do Better Auth)
                 + lider_id (nullable → FK para users; define o líder direto desta pessoa)

eventos          + organization_id
                 status: planejamento | inscricoes_abertas | em_andamento | finalizado | cancelado

inscricoes       + organization_id

locais           + organization_id
```

**Tabelas que herdam isolamento via FK** (não precisam de organization_id próprio):
- `quartos` — via `local_id → locais.organization_id`
- `camas` — via `quarto_id → quartos → locais.organization_id`
- `pagamentos` — via `inscricao_id → inscricoes.organization_id`
- `configuracao_evento` — via `evento_id → eventos.organization_id`
- `despesas` — via `evento_id → eventos.organization_id`

### 4.2 Índices obrigatórios

```sql
CREATE INDEX ON pessoas (organization_id, id);
CREATE INDEX ON pessoas (organization_id, lider_id);
CREATE INDEX ON eventos (organization_id, id);
CREATE INDEX ON eventos (organization_id, status);
CREATE INDEX ON inscricoes (organization_id, evento_id);
CREATE INDEX ON locais (organization_id, id);
```

### 4.3 Vínculo Pessoa ↔ Usuário

- `pessoas.user_id` (nullable): preenchido quando a pessoa tem acesso ao sistema (login)
- `pessoas.lider_id` (nullable): FK para `users.id` — quem é o líder direto desta pessoa na hierarquia
- Uma pessoa sem `user_id` existe apenas como cadastro (ex: participante de retiro sem acesso ao sistema)
- Um `member` do Better Auth que seja Líder, Pastor ou superior deve ter uma `pessoa` correspondente com `user_id` preenchido

---

## 5. RBAC — Hierarquia de Papéis

### 5.1 Papéis e Escopo de Visibilidade

| Papel | Visibilidade de Pessoas | Operações |
|---|---|---|
| PRESIDENTE | Todas da org | Tudo — membros, eventos, inscrições, configurações |
| PASTOR_PRINCIPAL | Todas da org | Eventos, pessoas, inscrições; gerencia papéis abaixo |
| PASTOR_REDE | Apenas pessoas com `lider_id = seu user_id` | Eventos do contexto; vê e gerencia sua rede explícita |
| DISCIPULADOR | Apenas pessoas com `lider_id = seu user_id` | Vê e gerencia seus discípulos |
| LIDER_CELULA | Apenas pessoas com `lider_id = seu user_id` | Vê membros da célula |
| MEMBRO | Apenas a própria pessoa | Vê os próprios dados; pode se inscrever em eventos abertos |

### 5.2 Operações por Papel (matriz simplificada)

| Operação | PRESIDENTE | PASTOR_PRINCIPAL | PASTOR_REDE | DISCIPULADOR | LIDER_CELULA | MEMBRO |
|---|---|---|---|---|---|---|
| Criar organização | ✓ (owner) | — | — | — | — | — |
| Convidar membros | ✓ | ✓ | — | — | — | — |
| Alterar papéis | ✓ | ✓ (exceto PRESIDENTE) | — | — | — | — |
| Criar evento | ✓ | ✓ | — | — | — | — |
| Editar evento | ✓ | ✓ | — | — | — | — |
| Transicionar status evento | ✓ | ✓ | — | — | — | — |
| Ver todos os eventos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inscrever pessoa | ✓ | ✓ | ✓ | ✓ | — | — |
| Ver todas as pessoas | ✓ | ✓ | — | — | — | — |
| Ver pessoas da rede | — | — | ✓ | ✓ | ✓ | — |
| Cadastrar pessoa | ✓ | ✓ | ✓ | — | — | — |

### 5.3 Transferência de Presidência

O PRESIDENTE pode alterar o papel de qualquer membro, incluindo promover outro membro a PRESIDENTE (e o próprio se torna PASTOR_PRINCIPAL ou sai). Better Auth suporta essa operação nativamente via `updateMemberRole`.

---

## 6. Módulos — v1.0 vs v1.1

### v1.0 — Core Multi-Tenant

| Módulo | Status | Entrega |
|---|---|---|
| Organizations | Novo | Criação self-service, convites, gestão de membros, org switcher |
| Auth + RBAC | Evolução | Hierarquia de 6 papéis, PermissionResolver, TenantMiddleware |
| Pessoas | Ajuste | +organization_id, +user_id, +lider_id, visibilidade hierárquica |
| Eventos | Ajuste | +organization_id, ciclo de vida completo, guards por papel |
| Inscrições | Ajuste | +organization_id, fluxo existente mantido |
| Acomodações | Ajuste | +organization_id em locais, módulo existente mantido |

### v1.1 — Feature Expansion

| Módulo | Entrega |
|---|---|
| Financeiro por Evento | Receitas, despesas, indicadores, break-even |
| Equipes por Evento | Times de servos/líderes por papel |
| Formulário Público | Inscrição externa sem login, aprovação manual |
| Indicadores Gerais | Taxa de presença, crescimento de membros, histórico |

---

## 7. Roadmap de Execução

### Phase 8.5 — Multi-Tenant Foundation (INSERIR AGORA)

**Backend:**
1. Habilitar plugin Better Auth Organizations
2. Migration em 2 etapas: (1) adicionar colunas nullable + seed org + backfill; (2) tornar NOT NULL
3. Criar índices compostos
4. Implementar `TenantMiddleware` no Fastify
5. Implementar `PermissionResolver` com matriz de papéis
6. Refatorar repositórios para herdar `BaseRepository` com guard de orgId
7. Endpoints de organizações (create, update, members, invitations)

**Frontend:**
1. Fluxo de criação de organização (onboarding)
2. `OrgContext` React — expõe `activeOrgId`, `userRole`
3. Org switcher no header
4. Página de gestão de membros e convites
5. Atualizar todas as query keys para `['org', orgId, ...]`
6. `queryClient.clear()` ao trocar de org

### Phase 8 — Eventos CRUD UI (retomar após 8.5)
- Completar EventosPage com org context
- Transições de status com validação
- Guards de papel por operação

### Phase 9 — Inscrições CRUD + Pagamentos UI
- Fluxo completo de inscrição no contexto da org
- Registro de pagamentos, filtro de inadimplentes, cancelamento

### Phase 10 — Acomodações Polish + Offline Hardening
- Update otimista, export PDF, banner offline

### Phase 11 — Deploy v1.0 Multi-Tenant
- Build de produção, configuração de env, primeiro cliente real

---

## 8. Riscos e Mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| Vazamento cross-tenant por query sem guard | Alta | `BaseRepository` injeta `organization_id` automaticamente; testes de integração validam isolamento |
| Better Auth Organizations incompatível com hierarquia customizada | Média | Plugin armazena role como string; lógica de hierarquia fica no `PermissionResolver` da aplicação. Spike técnico antes de commitar. |
| Migration de dados existentes sem organization_id | Média | Migration em 2 etapas (nullable → backfill → NOT NULL); script idempotente testado em staging |
| Cache cross-tenant no frontend ao trocar de org | Média | Query keys incluem `orgId`; `queryClient.clear()` na troca de org |
| Performance em tabelas sem índice composto | Baixa | Índices `(organization_id, id)` criados na própria migration da Phase 8.5 |

---

## 9. Definições Abertas para Phase 8.5

Antes de iniciar o código, confirmar:

1. **Visibilidade do Pastor de Rede em eventos:** ele vê todos os eventos da org ou apenas eventos onde ele (ou alguém de sua rede) está inscrito?
2. **Slug da organização:** gerado automaticamente a partir do nome, ou o usuário escolhe no onboarding?
3. **E-mail de convite:** Better Auth envia nativo ou precisamos de provedor SMTP próprio para v1.0?
