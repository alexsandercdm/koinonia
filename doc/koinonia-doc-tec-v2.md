# KOINONIA - Documentação Técnica v2.0
*Gestão de Retiros Espirituais*

## 🔄 Atualização v2.0 - Mudança de Paradigma de Autenticação

### Mudança Principal
**Substituição do Supabase Auth por Better Auth + PostgreSQL próprio**

**Motivação:**
- Eliminar dependência externa crítica
- Obter controle total do servidor
- Reduzir custos e vendor lock-in
- Melhorar performance

---

**KOINONIA**  
*Gestão de Retiros Espirituais*

Documentação Técnica de Arquitetura e Desenvolvimento

Versão 2.0  •  2026  
Elaborado por: Alex  •  Status: Implementação com Better Auth

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
| **PostgreSQL 15 + Drizzle ORM  —  Infraestrutura** |

## **1.2 Stack Tecnológico v2.0**

| Camada | Tecnologia & Justificativa |
| :---- | :---- |
| Frontend | React 18 \+ Vite — HMR rápido, bundle otimizado para mobile |
| Estilização | Tailwind CSS \+ shadcn/ui — design system consistente, mobile-first |
| Estado Servidor | TanStack Query v5 — cache, refetch, otimistic updates |
| Tabelas/Listas | TanStack Table v8 — virtualização para listas de 500+ participantes |
| Backend | Fastify 4 \+ TypeScript — throughput \~4x superior ao Express, schema-first |
| ORM/DB Client | Drizzle ORM — type-safe, migrações versionadas, zero overhead |
| Banco de Dados | PostgreSQL 15 — self-hosted, controle total |
| **Autenticação** | **Better Auth \+ JWT — controle total, zero dependências externas** |
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
| 3\. Middleware Better Auth | Valida JWT, extrai user context e roles |
| 4\. Controller | Mapeia DTO de entrada para parâmetros do Use Case |
| 5\. Use Case | Executa regra de negócio, chama Repository(ies) necessários |
| 6\. Repository | Converte entidades de domínio em queries Drizzle ORM |
| 7\. PostgreSQL | Executa query, retorna resultado |
| 8\. Response | Controller serializa resposta, Fastify aplica schema de saída Zod |

## **1.4 Autenticação e Autorização v2.0**

O sistema utiliza **Better Auth** com PostgreSQL e JWT gerenciado pelo próprio servidor. Cada token carrega claims de role (admin, lider, servo) com validação via middleware customizado.

### Schema de Autenticação

```sql
users (id, email, name, role, created_at, updated_at)
sessions (id, user_id, token, expires_at)
accounts (id, user_id, provider, provider_account_id)
verification_tokens (id, user_id, token, expires_at)
```

### Roles e Permissões

* **admin** — acesso total a todos os módulos e todos os eventos
* **lider** — acesso ao evento em que está escalado como líder
* **servo** — acesso de leitura ao próprio perfil e ao mapa de acomodação

### Middleware de Autorização

```typescript
// Middleware customizado para validação de roles
app.addHook('preHandler', async (request, reply) => {
  const user = await auth.validateToken(request.headers.authorization)
  if (!hasRequiredRole(user.role, requiredRole)) {
    reply.code(403).send({ error: 'Forbidden' })
  }
})
```

## **1.5 Estratégia de API (RESTful)**

A API segue convenções RESTful com versionamento por URL (/api/v1/...). Recursos são nomeados no plural. Operações de negócio que não se encaixam em CRUD utilizam sub-rotas com verbos explícitos (ex.: /inscricoes/:id/confirmar-pagamento).

| Método | Padrão de Rota |
| :---- | :---- |
| POST | /api/v1/auth/login — autenticação |
| POST | /api/v1/auth/register — criação de usuário |
| POST | /api/v1/auth/logout — encerra sessão |
| GET | /api/v1/participantes — lista paginada com filtros |
| POST | /api/v1/participantes — cria novo participante |
| GET | /api/v1/participantes/:id — detalhe de um participante |
| PATCH | /api/v1/participantes/:id — atualização parcial |
| DELETE | /api/v1/participantes/:id — soft-delete (deleted\_at) |

  **2\. MODELAGEM DE DADOS v2.0**

## **2.1 Schema Completo do Banco**

### **Tabelas de Autenticação (Better Auth)**

#### **Tabela: users**
| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY DEFAULT gen\_random\_uuid() |
| email | varchar(200) UNIQUE NOT NULL |
| name | varchar(200) NOT NULL |
| role | enum('admin','lider','servo') DEFAULT 'servo' |
| password_hash | varchar(255) NOT NULL |
| created_at | timestamptz DEFAULT now() |
| updated_at | timestamptz DEFAULT now() |

#### **Tabela: sessions**
| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY DEFAULT gen\_random\_uuid() |
| user_id | uuid FK → users(id) NOT NULL |
| token | varchar(255) UNIQUE NOT NULL |
| expires_at | timestamptz NOT NULL |
| created_at | timestamptz DEFAULT now() |

### **Tabelas de Negócio (Mantidas)**

#### **Tabela: pessoas**
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
| created_at | timestamptz DEFAULT now() |
| updated_at | timestamptz DEFAULT now() |
| deleted_at | timestamptz NULLABLE — soft-delete |

#### **Tabela: eventos**
| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| nome | varchar(200) NOT NULL |
| descricao | text |
| data_inicio | date NOT NULL |
| data_fim | date NOT NULL |
| local_id | uuid FK → locais(id) NOT NULL |
| valor_inscricao_encontrista | numeric(10,2) NOT NULL |
| valor_inscricao_servo | numeric(10,2) DEFAULT 0 |
| capacidade_maxima | int NOT NULL |
| status | enum('rascunho','aberto','encerrado','realizado') |
| created_at / updated_at | timestamptz |

#### **Tabela: inscricoes**
| Coluna | Tipo / Constraint |
| :---- | :---- |
| id | uuid PRIMARY KEY |
| evento_id | uuid FK → eventos(id) NOT NULL |
| pessoa_id | uuid FK → pessoas(id) NOT NULL |
| papel | enum('encontrista','servo') NOT NULL |
| valor_total | numeric(10,2) NOT NULL |
| valor_pago | numeric(10,2) DEFAULT 0 |
| status_pagamento | enum('pendente','pago_parcial','pago_total') GENERATED |
| cama_id | uuid FK → camas(id) NULLABLE |
| observacoes | text |
| created_at / updated_at | timestamptz |
| UNIQUE | (evento_id, pessoa_id) — impede dupla inscrição |

## **2.2 Relacionamentos Chave**

* user (1) ←→ (N) sessions — múltiplas sessões por usuário
* pessoa (1) ←→ (N) inscricoes ←→ (1) evento — uma pessoa pode estar em vários eventos
* inscricao (1) ←→ (N) pagamentos — suporte a parcelamentos
* inscricao (N) → (1) cama — atribuição de acomodação
* evento → local — um retiro ocorre em um único local

  **3\. REQUISITOS FUNCIONAIS E NÃO FUNCIONAIS v2.0**

## **3.1 Requisitos Funcionais (RF) - Atualizados**

### **Módulo A — Autenticação (NOVO)**

| RF | Descrição |
| :---- | :---- |
| RF00 | Login com email e senha usando Better Auth |
| RF01 | Registro de novos usuários com validação de email |
| RF02 | Logout com invalidação de token |
| RF03 | Refresh token automático |
| RF04 | Recuperação de senha via email |
| RF05 | Gerenciamento de roles (admin, lider, servo) |
| RF06 | Middleware de autorização por rota |

### **Módulo B — Gestão de Pessoas**

| RF | Descrição |
| :---- | :---- |
| RF07 | Cadastrar participante com dados pessoais, de saúde e contato de emergência |
| RF08 | Buscar participante por nome, telefone ou padrinho (autocomplete) |
| RF09 | Visualizar histórico de eventos de um participante |
| RF10 | Editar dados de saúde com log de alteração |
| RF11 | Soft-delete de participante preservando histórico |

## **3.2 Requisitos Não Funcionais (RNF) - Atualizados**

| RNF | Descrição |
| :---- | :---- |
| RNF01 — Performance | Tempo de resposta \< 300ms para 95% das requisições |
| RNF02 — Mobile-First | Interface 100% responsiva, otimizada para mobile |
| RNF03 — Disponibilidade | SLA de 99,5% (self-hosted) |
| RNF04 — Segurança | HTTPS obrigatório; JWT com expiração de 8h; bcrypt para senhas |
| RNF05 — Independência | Zero dependências externas de autenticação |
| RNF06 — Escalabilidade | Controle próprio da infra de auth |
| RNF07 — Testes | Cobertura mínima de 70% nas camadas de auth e use cases |

  **4\. IMPLEMENTAÇÃO v2.0**

## **4.1 Setup do Better Auth**

### **Configuração do Servidor**

```typescript
// apps/api/src/config/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 8, // 8 horas
    updateAge: 60 * 60 * 1, // 1 hora
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
})
```

### **Middleware de Autenticação**

```typescript
// apps/api/src/middleware/auth.ts
export const authMiddleware = async (request: FastifyRequest) => {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    throw new Error('Unauthorized')
  }
  
  const session = await auth.validateSession(token)
  if (!session) {
    throw new Error('Invalid session')
  }
  
  return session
}
```

## **4.2 Frontend com Better Auth**

### **Configuração do Cliente**

```typescript
// apps/web/src/lib/auth.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})
```

### **Hooks de Autenticação**

```typescript
// apps/web/src/hooks/use-auth.ts
export const useAuth = () => {
  const { data: session, isLoading } = authClient.useSession()
  
  const login = async (email: string, password: string) => {
    return await authClient.signIn.email({
      email,
      password,
    })
  }
  
  const logout = async () => {
    return await authClient.signOut()
  }
  
  return {
    session,
    isLoading,
    login,
    logout,
  }
}
```

  **5\. ROADMAP DE IMPLEMENTAÇÃO v2.0**

## **5.1 Sprint 1 — Fundações + Better Auth (Semanas 1-2)**

| Tarefa | Descrição |
| :---- | :---- |
| **1** | Setup do Better Auth + schema de auth |
| **2** | Implementação de endpoints de auth |
| **3** | Middleware de autorização customizado |
| **4** | Migração do frontend para Better Auth |
| **5** | Testes de autenticação (unit + E2E) |
| **6** | CRUD de Participantes adaptado |
| **7** | Interface de Login/Register |
| **8** | Proteção de rotas no frontend |

## **5.2 Sprint 2 — Eventos e Inscrições (Semanas 3-4)**

| Tarefa | Descrição |
| :---- | :---- |
| **1** | CRUD de Eventos com controle de acesso |
| **2** | Sistema de Inscrições |
| **3** | Controle de Pagamentos |
| **4** | Telas de gestão de eventos |
| **5** | Dashboard de inscrições |

## **5.3 Sprint 3 — Acomodação e Financeiro (Semanas 5-6)**

| Tarefa | Descrição |
| :---- | :---- |
| **1** | Módulo Cama-a-Cama completo |
| **2** | Dashboard Financeiro |
| **3** | Relatórios e exportações |
| **4** | Testes completos do sistema |

## **5.4 Sprint 4 — Deploy e Polimento (Semanas 7-8)**

| Tarefa | Descrição |
| :---- | :---- |
| **1** | Setup Docker + Coolify |
| **2** | Deploy em produção |
| **3** | Monitoramento e logs |
| **4** | Documentação final |

  **6\. CONSIDERAÇÕES FINAIS v2.0**

## **6.1 Benefícios da Migração**

- ✅ **Independência Total**: Zero dependências externas
- ✅ **Performance**: Sem chamadas externas para auth
- ✅ **Customização**: Controle total do fluxo
- ✅ **Custo Zero**: Sem gastos com auth service
- ✅ **Segurança**: Implementação própria de segurança
- ✅ **Escalabilidade**: Controle próprio da infra

## **6.2 Próximos Passos**

1. **Aprovação**: Confirmar mudança de paradigma
2. **Implementação**: Seguir roadmap v2.0
3. **Validação**: Testes completos
4. **Deploy**: Produção com Better Auth

---

| *KOINONIA  •  Que a tecnologia sirva ao Reino* Elaborado por Alex  •  Versão 2.0  •  2026 |
| :---: |
