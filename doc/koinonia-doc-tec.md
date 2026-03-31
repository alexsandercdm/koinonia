  # KOINONIA - Documentação Técnica v2.0
*Gestão de Retiros Espirituais*

## 🔄 ATUALIZADO - Migração para Better Auth Concluída

**Status:** ✅ **MIGRAÇÃO CONCLUÍDA**  
**Data:** 29/03/2026  
**Mudança:** Supabase Auth → Better Auth (self-hosted)

**Resumo da Implementação:**
- ✅ Better Auth configurado com PostgreSQL
- ✅ Schema de autenticação criado e migrado
- ✅ Middleware de autorização implementado
- ✅ Frontend migrado com React Context
- ✅ Telas de login/register criadas
- ✅ Proteção de rotas implementada
- ✅ Testes unit e E2E configurados
- ✅ Zero dependências externas de autenticação

---

**KOINONIA**  
*Gestão de Retiros Espirituais*

Documentação Técnica de Arquitetura e Desenvolvimento

Versão 2.0  •  2026  
Elaborado por: Alex  •  Status: **Produção com Better Auth**

# **Sumário**

  **1\. ARQUITETURA DO SISTEMA (SYSTEM DESIGN)**

## **1.1 Visão Geral da Arquitetura**

O Koinonia adota uma arquitetura em camadas baseada nos princípios de Clean Architecture, com separação clara entre domínio, aplicação, infraestrutura e interface. A comunicação entre camadas ocorre de forma unidirecional, garantindo baixo acoplamento e alta testabilidade.

### **Diagrama de Camadas**

| CLIENTE (Browser / Mobile) |
| :---: |
| **React (Vite) \+ Tailwind CSS \+ TanStack Query** |
| **API HTTP/REST (JSON)** |
| **Fastify \+ TypeScript  —  Camada de Aplicação** |
| **Domain Services \+ Use Cases  —  Camada de Domínio** |
| **Supabase (PostgreSQL) \+ Storage  —  Infraestrutura** |

## **1.2 Stack Tecnológico**

| Camada | Tecnologia & Justificativa |
| :---- | :---- |
| Frontend | React 18 \+ Vite — HMR rápido, bundle otimizado para mobile |
| Estilização | Tailwind CSS \+ shadcn/ui — design system consistente, mobile-first |
| Estado Servidor | TanStack Query v5 — cache, refetch, otimistic updates |
| Tabelas/Listas | TanStack Table v8 — virtualização para listas de 500+ participantes |
| Backend | Fastify 4 \+ TypeScript — throughput \~4x superior ao Express, schema-first |
| ORM/DB Client | Drizzle ORM — type-safe, migrações versionadas, zero overhead |
| Banco de Dados | PostgreSQL 15 via Supabase — RLS, Realtime, Storage inclusos |
| Autenticação | Supabase Auth (JWT) — multi-role, RLS automático por usuário |
| Validação | Zod — schema compartilhado entre frontend e backend |
| Testes | Vitest (unit) \+ Playwright (E2E) — cobertura full-stack |
| Infra / Deploy | Docker \+ Coolify — self-hosted, custo mínimo, CI/CD integrado |
| Monorepo | Turborepo — build cache, workspace compartilhado de tipos |

## **1.3 Fluxo de Comunicação entre Camadas**

O fluxo segue o padrão Request → Controller → Use Case → Repository → Database, com respostas no sentido inverso. Cada Use Case é responsável por exatamente uma operação de negócio, tornando o sistema extensível sem risco de regressões.

| Etapa | Descrição |
| :---- | :---- |
| 1\. HTTP Request | Cliente envia requisição com JWT no header Authorization |
| 2\. Fastify Route | Valida schema de entrada com Zod, extrai contexto de autenticação |
| 3\. Controller | Mapeia DTO de entrada para parâmetros do Use Case |
| 4\. Use Case | Executa regra de negócio, chama Repository(ies) necessários |
| 5\. Repository | Converte entidades de domínio em queries Drizzle ORM |
| 6\. Supabase/PG | Executa query com RLS ativo, retorna resultado |
| 7\. Response | Controller serializa resposta, Fastify aplica schema de saída Zod |

## **1.4 Autenticação e Autorização**

O sistema utiliza Supabase Auth com JWT (RS256). Cada token carrega claims de role (admin, lider, servo), permitindo Row-Level Security (RLS) no PostgreSQL sem lógica extra no backend.

* admin — acesso total a todos os módulos e todos os eventos

* lider — acesso ao evento em que está escalado como líder

* servo — acesso de leitura ao próprio perfil e ao mapa de acomodação

## **1.5 Estratégia de API (RESTful)**

A API segue convenções RESTful com versionamento por URL (/api/v1/...). Recursos são nomeados no plural. Operações de negócio que não se encaixam em CRUD utilizam sub-rotas com verbos explícitos (ex.: /inscricoes/:id/confirmar-pagamento).

| Método | Padrão de Rota |
| :---- | :---- |
| GET | /api/v1/participantes — lista paginada com filtros |
| POST | /api/v1/participantes — cria novo participante |
| GET | /api/v1/participantes/:id — detalhe de um participante |
| PATCH | /api/v1/participantes/:id — atualização parcial |
| DELETE | /api/v1/participantes/:id — soft-delete (deleted\_at) |
| POST | /api/v1/inscricoes/:id/confirmar-pagamento — action específica |
| POST | /api/v1/acomodacoes/camas/:id/atribuir — atribuição de hóspede |

  **2\. MODELAGEM DE DADOS**

## **2.1 Diagrama Entidade-Relacionamento (Descritivo)**

As tabelas centrais são pessoas, eventos e inscricoes. A hierarquia de acomodação (locais → quartos → camas) é resolvida pelo módulo Cama-a-Cama. As transações financeiras são vinculadas a eventos e, opcionalmente, a inscrições.

### **Tabela: pessoas**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY DEFAULT gen\_random\_uuid() |
| nome | varchar(200) NOT NULL |
| genero | enum('M','F') NOT NULL |
| data\_nascimento | date |
| telefone | varchar(20) |
| email | varchar(200) UNIQUE |
| padrinho\_id | uuid FK → pessoas(id) NULLABLE |
| alergias | text — lista livre separada por vírgula |
| restricoes\_alimentares | text\[\] |
| medicamentos | text |
| condicoes\_medicas | text |
| contato\_emergencia\_nome | varchar(200) |
| contato\_emergencia\_tel | varchar(20) |
| created\_at | timestamptz DEFAULT now() |
| updated\_at | timestamptz DEFAULT now() |
| deleted\_at | timestamptz NULLABLE — soft-delete |

### **Tabela: eventos**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| nome | varchar(200) NOT NULL |
| descricao | text |
| data\_inicio | date NOT NULL |
| data\_fim | date NOT NULL |
| local\_id | uuid FK → locais(id) NOT NULL |
| valor\_inscricao\_encontrista | numeric(10,2) NOT NULL |
| valor\_inscricao\_servo | numeric(10,2) DEFAULT 0 |
| capacidade\_maxima | int NOT NULL |
| status | enum('rascunho','aberto','encerrado','realizado') |
| created\_at / updated\_at | timestamptz |

### **Tabela: inscricoes**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| evento\_id | uuid FK → eventos(id) NOT NULL |
| pessoa\_id | uuid FK → pessoas(id) NOT NULL |
| papel | enum('encontrista','servo') NOT NULL |
| valor\_total | numeric(10,2) NOT NULL |
| valor\_pago | numeric(10,2) DEFAULT 0 |
| status\_pagamento | enum('pendente','pago\_parcial','pago\_total') GENERATED |
| cama\_id | uuid FK → camas(id) NULLABLE |
| observacoes | text |
| created\_at / updated\_at | timestamptz |
| UNIQUE | (evento\_id, pessoa\_id) — impede dupla inscrição |

### **Tabela: pagamentos**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| inscricao\_id | uuid FK → inscricoes(id) NOT NULL |
| valor | numeric(10,2) NOT NULL |
| forma\_pagamento | enum('pix','dinheiro','cartao','outro') |
| data\_pagamento | date NOT NULL |
| comprovante\_url | text NULLABLE — Supabase Storage |
| registrado\_por | uuid FK → auth.users(id) |
| created\_at | timestamptz |

### **Tabela: locais**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| nome | varchar(200) NOT NULL |
| endereco | text |
| capacidade\_total | int |
| created\_at / updated\_at | timestamptz |

### **Tabela: quartos**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| local\_id | uuid FK → locais(id) NOT NULL |
| nome | varchar(100) NOT NULL |
| genero\_permitido | enum('M','F','MISTO') NOT NULL |
| capacidade | int NOT NULL |
| created\_at / updated\_at | timestamptz |

### **Tabela: camas**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| quarto\_id | uuid FK → quartos(id) NOT NULL |
| identificacao | varchar(50) — ex.: 'A1', 'Beliche Superior' |
| tipo | enum('solteiro','beliche\_superior','beliche\_inferior','casal') |
| created\_at | timestamptz |

### **Tabela: despesas**

| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| evento\_id | uuid FK → eventos(id) NOT NULL |
| descricao | varchar(300) NOT NULL |
| categoria | enum('alimentacao','transporte','material','hospedagem','outro') |
| valor | numeric(10,2) NOT NULL |
| data\_despesa | date NOT NULL |
| comprovante\_url | text NULLABLE |
| registrado\_por | uuid FK → auth.users(id) |
| created\_at | timestamptz |

## **2.2 Relacionamentos Chave**

* pessoa (1) ←→ (N) inscricoes ←→ (1) evento — uma pessoa pode estar em vários eventos, mas apenas 1x por evento

* inscricao (1) ←→ (N) pagamentos — suporte a parcelamentos

* inscricao (N) → (1) cama — atribuição de acomodação (UNIQUE por evento via trigger)

* quarto → genero\_permitido — regra de separação de gênero enforçada em DB e backend

* evento → local — um retiro ocorre em um único local

  **3\. REQUISITOS FUNCIONAIS E NÃO FUNCIONAIS**

## **3.1 Requisitos Funcionais (RF)**

### **Módulo A — Gestão de Pessoas**

| RF | Descrição |
| :---- | :---- |
| RF01 | Cadastrar participante com dados pessoais, de saúde e contato de emergência |
| RF02 | Buscar participante por nome, telefone ou padrinho (autocomplete) |
| RF03 | Visualizar histórico de eventos de um participante (edições anteriores) |
| RF04 | Editar dados de saúde (alergias, medicamentos) com log de alteração |
| RF05 | Soft-delete de participante preservando histórico de inscrições |

### **Módulo B — Inscrições e Eventos**

| RF | Descrição |
| :---- | :---- |
| RF06 | Criar e gerenciar eventos com período, local e capacidade máxima |
| RF07 | Inscrever participante em evento como 'Encontrista' ou 'Servo' |
| RF08 | Definir valor de inscrição por papel e por evento |
| RF09 | Registrar pagamentos parciais com forma de pagamento e comprovante |
| RF10 | Calcular automaticamente status: Pendente / Pago Parcial / Pago Total |
| RF11 | Emitir lista de inadimplentes para o líder responsável |
| RF12 | Cancelar inscrição com estorno registrado em pagamentos |

### **Módulo C — Acomodação (Cama-a-Cama)**

| RF | Descrição |
| :---- | :---- |
| RF13 | Cadastrar locais (chácaras) com nome, endereço e capacidade |
| RF14 | Cadastrar quartos com tipo de gênero permitido (M/F/Misto) e capacidade |
| RF15 | Cadastrar camas com identificação e tipo (solteiro, beliche) |
| RF16 | Visualizar mapa de acomodação com status: disponível / ocupado / bloqueado |
| RF17 | Atribuir inscrito a uma cama com validação de gênero e disponibilidade |
| RF18 | Remover atribuição de cama (liberar) sem cancelar inscrição |
| RF19 | Exportar mapa de quartos em PDF para uso offline na chácara |

### **Módulo D — Financeiro**

| RF | Descrição |
| :---- | :---- |
| RF20 | Dashboard financeiro com: Previsto vs Arrecadado vs Despesas |
| RF21 | Registrar despesas por categoria com comprovante |
| RF22 | Calcular ponto de equilíbrio (break-even) do evento em tempo real |
| RF23 | Relatório de fluxo de caixa por período (entrada de pagamentos x saída de despesas) |
| RF24 | Exportar relatório financeiro em CSV ou PDF |

### **Módulo E — Administração**

| RF | Descrição |
| :---- | :---- |
| RF25 | Gerenciar usuários do sistema com definição de role |
| RF26 | Log de auditoria de todas as operações sensíveis (pagamentos, acomodação) |
| RF27 | Configuração de templates de evento (reutilizar estrutura de quartos) |

## **3.2 Requisitos Não Funcionais (RNF)**

| RNF | Descrição |
| :---- | :---- |
| RNF01 — Performance | Tempo de resposta \< 300ms para 95% das requisições (exceto relatórios) |
| RNF02 — Mobile-First | Interface 100% responsiva, otimizada para telas 360px+; touch targets ≥ 48px |
| RNF03 — Disponibilidade | SLA de 99,5% (tolerado via Docker \+ Coolify com restart policy) |
| RNF04 — Segurança | HTTPS obrigatório; JWT com expiração de 8h; RLS no banco de dados |
| RNF05 — Acessibilidade | Contraste mínimo WCAG AA; font Inter ≥ 16px para usuários idosos |
| RNF06 — Offline Grace | TanStack Query com staleTime configurado para funcionar com conexão instável na chácara |
| RNF07 — Backup | Supabase realiza backup diário automático; retenção de 7 dias no plano free |
| RNF08 — Auditoria | Todas as operações de escrita registradas em tabela audit\_log com user\_id e timestamp |
| RNF09 — Extensibilidade | Arquitetura preparada para Fase 2 (QR Code check-in) e Fase 3 (crachás \+ relatórios pós-encontro) |
| RNF10 — Testes | Cobertura mínima de 70% nas camadas de Use Case e Repository |

  **4\. DETALHAMENTO DE MÓDULOS — BACKEND & FRONTEND**

## **4.1 Módulo Pessoas**

### **Backend (Fastify)**

Rotas agrupadas sob /api/v1/participantes. O Use Case CreateParticipante valida unicidade de e-mail/telefone antes de inserir. Dados de saúde são armazenados em colunas separadas (não em JSON) para facilitar filtros e alertas no check-in.

* GET /participantes?q={busca}\&page=1\&pageSize=20 — retorna lista paginada

* POST /participantes — valida Zod schema ParticipanteCreateDTO

* GET /participantes/:id/historico — agrega eventos anteriores via JOIN inscricoes

* PATCH /participantes/:id/saude — requer role lider ou admin; gera entrada em audit\_log

### **Frontend (React)**

A tela de cadastro utiliza React Hook Form \+ Zod para validação em tempo real. Campos de saúde são agrupados em uma seção expansível para não intimidar o preenchimento inicial. A busca de participante usa TanStack Query com debounce de 300ms para chamadas ao endpoint de autocomplete.

## **4.2 Módulo Acomodação (Cama-a-Cama)**

### **Lógica de Negócio Crítica**

* Validação de gênero: ao atribuir uma cama, o backend verifica quarto.genero\_permitido vs pessoa.genero. Retorna 422 se incompatível.

* Capacidade: a atribuição verifica se a cama já possui uma inscrição ativa. Um índice UNIQUE parcial no banco garante isso mesmo em race conditions concorrentes.

* Lock otimista: a atribuição usa uma transação PostgreSQL com SELECT ... FOR UPDATE para evitar dupla atribuição simultânea.

### **Backend (Fastify)**

* GET /eventos/:eventoId/mapa-acomodacao — retorna local → quartos → camas com status calculado em tempo real

* POST /acomodacoes/camas/:camaId/atribuir — body: { inscricao\_id }

* DELETE /acomodacoes/camas/:camaId/atribuir — libera cama

### **Frontend (React) — Interface Visual**

O mapa de acomodação é renderizado como uma grade de cards por quarto. Cada card de cama exibe: identificação, nome do hóspede (se atribuído), ícone de gênero e cor de status (verde \= livre, vermelho \= ocupado). A atribuição é feita via painel lateral deslizante (Sheet do shadcn/ui) com busca de inscritos sem cama. Em mobile, o painel ocupa 90% da tela com scroll interno.

## **4.3 Módulo Financeiro**

### **Cálculo de Break-Even**

O ponto de equilíbrio é calculado dinamicamente: Break-even \= total\_despesas\_previstas / valor\_inscricao\_encontrista. O dashboard exibe: inscritos necessários para cobrir custos, inscritos confirmados e um indicador visual de semáforo (vermelho/amarelo/verde).

### **Backend (Fastify)**

* GET /eventos/:id/financeiro/resumo — retorna previsto, arrecadado, despesas, saldo e break-even

* POST /inscricoes/:id/pagamentos — registra parcela com upload de comprovante para Supabase Storage

* GET /eventos/:id/financeiro/fluxo-caixa?de=2025-01-01\&ate=2025-03-31 — retorna array diário

### **Frontend (React)**

O painel financeiro usa cards de KPI com TanStack Query (refetch a cada 30s). O fluxo de caixa é exibido em um gráfico de barras (Recharts) com entradas em verde e saídas em vermelho. Em mobile, os cards empilham verticalmente e o gráfico scrollable horizontalmente.

  **5\. BACKLOG DE ATIVIDADES — PRODUCT BACKLOG**

## **Visão Geral do Roadmap**

| Fase | Sprint / Período / Entrega |
| :---- | :---- |
| MVP (Fase 1\) | Sprints 1–4 → \~8 semanas → Sistema completo utilizável |
| Fase 2 | Sprint 5–6 → Check-in QR Code \+ App mobile-first melhorado |
| Fase 3 | Sprint 7–8 → Crachás automáticos \+ Relatório pós-encontro |

| SPRINT 1 — Fundação (Semanas 1–2) |  |
| ----- | :---- |
| Objetivo: Infraestrutura funcionando, autenticação e cadastro básico de participantes |  |
| **1** | Setup do monorepo com Turborepo (apps/api, apps/web, packages/shared) |
| **2** | Configuração do Fastify com TypeScript, Zod e estrutura de pastas Clean Architecture |
| **3** | Setup do Supabase: projeto, variáveis de ambiente, client (Drizzle ORM) |
| **4** | Schema inicial do banco: tabelas pessoas, eventos, auth.users |
| **5** | Migrações versionadas com drizzle-kit |
| **6** | Autenticação completa: login, logout, refresh token, middleware de role |
| **7** | CRUD completo de Participantes (RF01, RF02, RF05) |
| **8** | Interface de Listagem de Participantes com busca e paginação (TanStack Table) |
| **9** | Formulário de Cadastro com validação Zod \+ React Hook Form |
| **10** | Setup Docker Compose local (api \+ postgres local para dev) |
| **11** | Pipeline CI: lint \+ typecheck \+ testes unitários (GitHub Actions) |

| SPRINT 2 — Inscrições e Eventos (Semanas 3–4) |  |
| ----- | :---- |
| Objetivo: Ciclo completo de inscrição de participantes em eventos com controle de pagamento |  |
| **1** | CRUD de Eventos com vínculo a Local (RF06) |
| **2** | Tela de criação/edição de evento com seleção de local e capacidade |
| **3** | Use Case: InscricaoCreate com validação de capacidade e duplicidade (RF07, RF08) |
| **4** | Use Case: RegistrarPagamento com atualização de status automática (RF09, RF10) |
| **5** | Tela de Inscrições: tabela com filtros por status de pagamento e papel |
| **6** | Painel de Inscrição Individual: histórico de pagamentos \+ adicionar parcela (RF12) |
| **7** | Lista de inadimplentes filtrada (RF11) |
| **8** | Histórico de participações de um participante (RF03) |
| **9** | Testes de integração: fluxo completo inscrição → pagamento parcial → total |

| SPRINT 3 — Módulo Cama-a-Cama (Semanas 5–6) |  |
| ----- | :---- |
| Objetivo: Gestão completa de acomodação com mapa visual e regras de gênero e capacidade |  |
| **1** | CRUD de Locais e Quartos com tipo de gênero (RF13, RF14) |
| **2** | CRUD de Camas com identificação e tipo (RF15) |
| **3** | Use Case: AtribuirCama com validação de gênero, capacidade e lock transacional (RF17) |
| **4** | Use Case: LiberarCama sem cancelar inscrição (RF18) |
| **5** | Endpoint GET /mapa-acomodacao com status calculado em tempo real (RF16) |
| **6** | Interface do Mapa de Acomodação: grade por quarto com cards de cama |
| **7** | Painel lateral de atribuição com busca de inscritos sem cama |
| **8** | Responsividade mobile do mapa (scroll horizontal por quarto, painel em sheet) |
| **9** | Exportação do mapa de quartos em PDF (RF19) — usando jsPDF no frontend |
| **10** | Testes: validação de conflito de gênero e race condition de atribuição simultânea |

| SPRINT 4 — Financeiro e Polimento (Semanas 7–8) |  |
| ----- | :---- |
| Objetivo: Dashboard financeiro completo, relatórios e ajustes de UX/acessibilidade para entrega do MVP |  |
| **1** | Use Case: ResumoFinanceiro com cálculo de break-even (RF20, RF22) |
| **2** | Use Case: FluxoCaixa por período (RF23) |
| **3** | CRUD de Despesas com categorização e upload de comprovante (RF21) |
| **4** | Dashboard financeiro com KPI cards e gráfico Recharts (RF20) |
| **5** | Exportação de relatório financeiro em CSV (RF24) |
| **6** | Módulo de Administração: gerenciamento de usuários e roles (RF25) |
| **7** | Tabela audit\_log e middleware de registro de ações (RF26, RNF08) |
| **8** | Testes E2E (Playwright): fluxo crítico cadastro → inscrição → acomodação → pagamento |
| **9** | Revisão de acessibilidade: contraste WCAG AA, ARIA labels, font size mínimo |
| **10** | Setup Docker \+ Coolify para deploy em produção |
| **11** | Documentação de API (Swagger/OpenAPI gerado pelo Fastify) |

## **5.1 Épicos de Fase 2 (Futuro)**

* Check-in QR Code: geração de QR por inscrição, leitura via câmera mobile, marcação de presença em tempo real

* App Mobile Nativo: considerar React Native (Expo) reaproveitando lógica de negócio do monorepo

* Notificações Push: lembrete de pagamento pendente via Supabase Edge Functions \+ Resend

## **5.2 Épicos de Fase 3 (Futuro)**

* Impressão de Crachás: template PDF gerado no backend com nome, foto e QR Code do participante

* Relatório de Consolidação: análise pós-evento com presença, perfil demográfico e indicadores espirituais

* Portal do Encontrista: área onde o próprio participante acompanha sua inscrição e pagamento (link público com token)

  **6\. PLANO DE IMPLEMENTAÇÃO — SETUP & DEPLOY**

## **6.1 Pré-requisitos**

* Node.js 20 LTS \+ pnpm 9+

* Docker Desktop (local) / Docker Engine (servidor)

* Conta Supabase (plano gratuito suficiente para MVP)

* Domínio apontado para o IP do servidor Coolify

* Git \+ repositório privado (GitHub)

## **6.2 Setup Local (Desenvolvimento)**

### **Passo 1 — Clonar e instalar dependências**

git clone https://github.com/seu-org/koinonia.git

cd koinonia

pnpm install

### **Passo 2 — Configurar variáveis de ambiente**

cp apps/api/.env.example apps/api/.env

cp apps/web/.env.example apps/web/.env

Preencher no .env da API: DATABASE\_URL, SUPABASE\_URL, SUPABASE\_SERVICE\_ROLE\_KEY, JWT\_SECRET

### **Passo 3 — Subir banco local com Docker Compose**

docker compose \-f docker-compose.dev.yml up \-d

\# Sobe PostgreSQL 15 local na porta 5432

### **Passo 4 — Executar migrações**

pnpm \--filter api db:migrate

pnpm \--filter api db:seed  \# dados de demonstração

### **Passo 5 — Iniciar desenvolvimento**

pnpm dev  \# inicia api (porta 3001\) e web (porta 3000\) em paralelo via Turborepo

## **6.3 Deploy em Produção (Docker \+ Coolify)**

### **Estrutura de Containers**

| Container | Responsabilidade |
| :---- | :---- |
| koinonia-api | Fastify API — porta 3001 interna |
| koinonia-web | React SPA servida via Nginx — porta 80/443 |
| caddy / traefik | Reverse proxy com HTTPS automático (Let's Encrypt) — gerenciado pelo Coolify |

### **Passo 1 — Instalar Coolify no VPS**

curl \-fsSL https://cdn.coollabs.io/coolify/install.sh | bash

Acessar painel Coolify em http://SEU\_IP:8000 e criar conta de admin.

### **Passo 2 — Adicionar repositório no Coolify**

No Coolify: Sources → GitHub → autorizar repositório koinonia. Criar dois Resources: um para api (Dockerfile em apps/api) e um para web (Dockerfile em apps/web).

### **Passo 3 — Configurar variáveis de ambiente**

No painel do Resource, adicionar todas as variáveis de .env.production. O Coolify injeta as variáveis no container em runtime.

### **Passo 4 — Configurar domínio e HTTPS**

Em cada Resource, definir domínio (ex.: api.koinonia.church e app.koinonia.church). O Coolify provisiona certificado SSL automaticamente via Caddy.

### **Passo 5 — Deploy e CI/CD**

Configurar webhook do GitHub no Coolify para deploy automático a cada push na branch main. O pipeline CI (GitHub Actions) roda lint e testes antes do deploy; em caso de falha, o Coolify não realiza o deploy.

## **6.4 Monitoramento Pós-Deploy**

* Health check: GET /api/v1/health — retorna 200 com versão e status do banco

* Logs: Coolify exibe logs em tempo real; configurar alertas de erro via Webhook no Slack/WhatsApp da liderança

* Métricas: Supabase Dashboard exibe queries lentas, storage usado e autenticações

* Backup: configurar cron semanal de pg\_dump para bucket S3 externo (ex.: Backblaze B2) como segurança adicional ao backup automático do Supabase

  **7\. CONSIDERAÇÕES FINAIS E RISCOS**

## **7.1 Riscos e Mitigações**

| Risco | Mitigação |
| :---- | :---- |
| Conexão instável na chácara durante o retiro | TanStack Query com staleTime longo; exportar PDF do mapa offline antes do evento |
| Dupla atribuição de cama (race condition) | SELECT FOR UPDATE em transação PostgreSQL \+ UNIQUE constraint no banco |
| Dados médicos sensíveis expostos | RLS garante acesso apenas a líderes do evento; dados não aparecem em listagens gerais |
| Crescimento além do plano Supabase gratuito | Arquitetura permite migrar para Supabase Pro ou PostgreSQL self-hosted sem alteração de código (apenas DATABASE\_URL) |
| Baixa adoção por líderes menos técnicos | UX mobile-first com fluxos de 3 cliques; treinamento presencial na primeira edição |

## **7.2 Extensibilidade para Fases 2 e 3**

A arquitetura foi desenhada para suportar as fases futuras sem refatorações maiores. A tabela inscricoes já possui campo qr\_code\_token (nullable) para Fase 2\. O módulo de relatórios (Fase 3\) consumirá os mesmos endpoints de financeiro e pessoas via queries agregadas adicionais, sem impacto nas rotas existentes. A separação de domínio em Use Cases independentes permite adicionar novos casos de uso sem modificar os existentes (princípio Open/Closed).

## **7.3 Sobre o Projeto**

O Koinonia é desenvolvido em caráter pró-bono como serviço à comunidade de fé. A escolha de tecnologias open-source (Fastify, React, PostgreSQL) e infraestrutura de baixo custo (Coolify \+ VPS) garante que o sistema possa ser mantido com custo próximo de zero após o desenvolvimento inicial, respeitando a realidade financeira de ministérios e igrejas.

| *KOINONIA  •  Que a tecnologia sirva ao Reino* Elaborado por Alex  •  Versão 1.0  •  2025 |
| :---: |

