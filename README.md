# Koinonia - Gestão de Retiros Espirituais

Sistema completo para gestão de retiros espirituais, desenvolvido com arquitetura moderna e tecnologias open-source.

## 🏗️ Arquitetura

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Fastify + TypeScript + Clean Architecture
- **Banco de Dados**: PostgreSQL 15 via Supabase
- **ORM**: Drizzle ORM (type-safe)
- **Autenticação**: Supabase Auth com JWT
- **Monorepo**: Turborepo
- **Testes**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Docker + Coolify

## 📋 Funcionalidades

### Módulo Pessoas
- ✅ Cadastro de participantes com dados pessoais e de saúde
- ✅ Busca por nome, telefone ou padrinho
- ✅ Histórico de eventos do participante
- ✅ Edição de dados de saúde com log de alterações
- ✅ Soft-delete de participantes

### Módulo Eventos e Inscrições
- ✅ Criação e gestão de eventos
- ✅ Inscrição de participantes (encontristas/servos)
- ✅ Controle de pagamentos parciais
- ✅ Listagem de inadimplentes
- ✅ Cancelamento de inscrições

### Módulo Acomodação (Cama-a-Cama)
- ✅ Gestão de locais, quartos e camas
- ✅ Mapa visual de acomodação
- ✅ Validação de gênero e capacidade
- ✅ Exportação em PDF

### Módulo Financeiro
- ✅ Dashboard financeiro completo
- ✅ Controle de despesas
- ✅ Cálculo de break-even
- ✅ Relatórios de fluxo de caixa

## 🚀 Setup Local

### Pré-requisitos
- Node.js 20 LTS+
- pnpm 9+
- Docker Desktop

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-org/koinonia.git
cd koinonia

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Preencher as variáveis no .env

# Subir banco de dados local
docker compose -f docker-compose.dev.yml up -d

# Executar migrações
pnpm --filter api db:migrate
pnpm --filter api db:seed

# Iniciar desenvolvimento
pnpm dev
```

### Acesso
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health Check: http://localhost:3001/api/v1/health

## 📁 Estrutura do Projeto

```
koinonia/
├── apps/
│   ├── api/          # Backend Fastify
│   └── web/          # Frontend React
├── packages/
│   └── shared/       # Tipos e schemas compartilhados
├── doc/             # Documentação técnica
└── docker-compose.dev.yml
```

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📦 Deploy

### Produção com Docker + Coolify

1. **Setup do Servidor**
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

2. **Configurar no Coolify**
   - Adicionar repositório GitHub
   - Criar resources para API e Web
   - Configurar variáveis de ambiente
   - Definir domínios e HTTPS

3. **Deploy Automático**
   - Push para main → CI/CD → Deploy automático

## 🔧 Scripts Úteis

```bash
# Development
pnpm dev              # Inicia API e Web
pnpm --filter api dev  # Apenas API
pnpm --filter web dev  # Apenas Web

# Build
pnpm build            # Build todos os pacotes
pnpm --filter api build
pnpm --filter web build

# Banco de Dados
pnpm --filter api db:migrate    # Rodar migrações
pnpm --filter api db:generate   # Gerar migrações
pnpm --filter api db:studio     # Abrir Drizzle Studio
```

## 📊 Roadmap

### MVP (Fase 1) - ✅ Sprint 1-4
- [x] Fundação: Monorepo + Autenticação
- [x] Pessoas: CRUD completo
- [x] Eventos: Gestão completa
- [x] Acomodação: Mapa visual
- [x] Financeiro: Dashboard

### Fase 2 - Sprint 5-6
- [ ] Check-in QR Code
- [ ] App mobile melhorado
- [ ] Notificações push

### Fase 3 - Sprint 7-8
- [ ] Impressão de crachás
- [ ] Relatórios pós-encontro
- [ ] Portal do encontrista

## 🤝 Contribuição

1. Fork o projeto
2. Criar branch feature/nome-da-feature
3. Commit com mensagens claras
4. Push para branch
5. Abrir Pull Request

## 📄 Licença

Este projeto é desenvolvido em caráter pró-bono para a comunidade de fé.

---

**KOINONIA • Que a tecnologia sirva ao Reino**
