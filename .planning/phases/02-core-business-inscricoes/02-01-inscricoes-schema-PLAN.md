# PLAN 02-01: Inscrições Database Schema

## Goal
Implementar as tabelas base para gestão de eventos, inscrições e pagamentos.

## Proposed Changes

### [Database]
Definição das entidades e relacionamentos no `schema.ts`.

#### [MODIFY] `apps/api/src/db/schema.ts`
1.  **Tabela `eventos`**:
    - `id`: UUID (Primary Key)
    - `nome`: VARCHAR(255)
    - `data_inicio`: TIMESTAMP
    - `data_fim`: TIMESTAMP
    - `capacidade_maxima`: INTEGER
    - `status`: ENUM ('ATIVO', 'CONCLUIDO', 'CANCELADO')
    - `created_at` / `updated_at`

2.  **Tabela `configuracao_evento`**:
    - `id`: UUID (PK)
    - `evento_id`: UUID (FK a `eventos`)
    - `papel`: ENUM ('ENCONTRISTA', 'SERVO')
    - `valor`: NUMERIC(10, 2)
    - Unique Constraint em (`evento_id`, `papel`)

3.  **Tabela `inscricoes`**:
    - `id`: UUID (PK)
    - `participante_id`: UUID (FK a `participantes` no módulo pessoas)
    - `evento_id`: UUID (FK a `eventos`)
    - `papel_participante`: ENUM ('ENCONTRISTA', 'SERVO')
    - `valor_total`: NUMERIC(10, 2)
    - `status`: ENUM ('PENDENTE', 'PAGO_PARCIAL', 'PAGO_TOTAL', 'LISTA_ESPERA', 'CANCELADA')
    - `created_at` / `updated_at`

4.  **Tabela `pagamentos`**:
    - `id`: UUID (PK)
    - `inscricao_id`: UUID (FK a `inscricoes`)
    - `valor`: NUMERIC(10, 2) -- Suporta negativo para estornos
    - `data_pagamento`: TIMESTAMP
    - `forma_pagamento`: VARCHAR(50) (PIX, CARTAO, DINHEIRO, etc.)
    - `comprovante_url`: TEXT (Path no servidor)
    - `usuario_registro_id`: UUID (FK ao `user` do Auth)

## Tasks
- [ ] Atualizar `schema.ts` com as novas tabelas.
- [ ] Gerar migração: `pnpm --filter api drizzle-kit generate`.
- [ ] Aplicar migração: `pnpm --filter api drizzle-kit push`.
- [ ] Gerar tipos do Drizzle (zod-drizzle se usado).

## Verification Plan
1. Executar `db:push` e verificar logs sem erros.
2. Inserir dados básicos via SQL local para testar constraints de FK.
