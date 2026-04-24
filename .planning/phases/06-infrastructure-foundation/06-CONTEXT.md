# Phase 6: Infrastructure Foundation - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Corrigir as 5 falhas de infraestrutura críticas (INFRA-01 a INFRA-05) que bloqueiam todas as telas de feature das fases 7–10. Esta fase não entrega UI de negócio — apenas torna o sistema capaz de entregar UI correta e resiliente.

</domain>

<decisions>
## Implementation Decisions

### ApiError Contract (INFRA-01)

- **D-01:** `ApiError` deve ser uma classe em `packages/shared` que estende `Error` e expõe:
  - `.status: number` — código HTTP numérico (400, 409, 422, 500…)
  - `.message: string` — mensagem legível do backend
  - `.fieldErrors: Record<string, string> | undefined` — erros por campo (preenchido em 422 para exibição inline nos formulários)

- **D-02:** `apiFetch` lança `ApiError` em qualquer resposta não-2xx (exceto 401, que continua redirecionando para `/login`). O corpo do erro deve ser parseado como JSON para extrair `message` e `fieldErrors` (formato Zod do Fastify).

- **D-03:** Handler global `onError` no `QueryClient` exibe toast com `ApiError.message`. Mutations individuais podem sobrescrever para casos específicos (ex: rollback visual em 409 na atribuição de cama da Phase 10).

- **D-04:** Em respostas 422, mapear `error.details` (array Zod do Fastify) → `fieldErrors: { [field]: message }` dentro do `ApiError`. Isso viabiliza `form.setError(field, { message })` diretamente nas fases seguintes.

### Cache Persistence (INFRA-02)

- **D-05:** Usar `@tanstack/react-query-persist-client` com `localStoragePersister`. GC time de 24h. Persistir todas as queries de negócio (exceto sessão/auth). Permitir comportamento offline gracioso no local do retiro com WiFi instável.

- **D-06:** Claude decide a estratégia de versionamento de cache key (ex: `buster` baseado em hash de build ou versão de package.json) para invalidar cache stale após deploy.

### Inscricoes Route (INFRA-03)

- **D-07:** Claude decide a shape exata da resposta, desde que inclua: campos base da inscrição + `pessoa.nome` + `pessoa.genero` joinados. Isso evita N+1 na Phase 9 e permite a lista de inscritos mostrar nome e ícone de gênero.

### Zod Drift (INFRA-04)

- **D-08:** Claude decide a estratégia de coerção (`z.coerce.number()` vs `.transform()`), desde que `valor_total` funcione com valores vindos como string do banco e `StatusEventoEnum` esteja alinhado entre shared e rotas Fastify.

### Packages (INFRA-05)

- **D-09:** Instalar os 5 pacotes ausentes: `react-day-picker`, `react-imask`, `react-dropzone`, `@tanstack/query-persist-client-core`, `@tanstack/react-query-persist-client`. Verificar se há mais Radix primitives faltando para as fases 7–9.

### Claude's Discretion

- Versionamento de cache key (D-06)
- Shape exata da resposta de `/eventos/:id/inscricoes` além dos campos mínimos especificados (D-07)
- Estratégia de coerção Zod para `valor_total` e `StatusEventoEnum` (D-08)
- Ordem de execução das correções dentro da fase

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contrato de API e fetch
- `apps/web/src/lib/api.ts` — implementação atual de `apiFetch` a ser refatorada (adicionar ApiError)
- `packages/shared/src/index.ts` — onde ApiError deve ser adicionado; contém todos os Zod schemas

### Rotas backend
- `apps/web/src/lib/api.ts` — confirmar que alteração em apiFetch não quebra chamadas existentes
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — rota de inscrições onde `GET /eventos/:id/inscricoes` deve ser adicionada

### Design e requisitos
- `.planning/ROADMAP.md` — success criteria das 5 correções INFRA-01 a INFRA-05
- `.planning/REQUIREMENTS.md` — definição de INFRA-01 a INFRA-05

### Padrão de hooks existente (referência para cache)
- `apps/web/src/hooks/use-acomodacoes.ts` — padrão canônico de TanStack Query no projeto

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/lib/api.ts:apiFetch` — função a ser refatorada para lançar `ApiError`
- `packages/shared/src/index.ts` — package já importado pelo web e api; local correto para `ApiError`
- `apps/web/src/hooks/use-acomodacoes.ts` — padrão de queryClient + invalidation para referência de persistência

### Established Patterns
- Todas as queries usam `apiFetch` centralizado — alterar `ApiError` aqui propaga para todos os módulos sem tocar em cada hook
- Fastify retorna erros Zod no formato `{ statusCode, error, message, details: [...] }` — mapear `details` para `fieldErrors`
- TanStack Query já configurado sem persistência — adicionar `persistQueryClient` wrapper no ponto de entrada (`main.tsx`)

### Integration Points
- `apps/web/src/main.tsx` — onde `QueryClient` é instanciado; adicionar `persistQueryClient` aqui
- `packages/shared/src/index.ts` — adicionar `ApiError` class e exportar
- `apps/api/src/modules/inscricoes/routes/inscricoes.ts` — adicionar rota `GET /eventos/:id/inscricoes`
- `apps/api/src/modules/inscricoes/controllers/` — adicionar método no controller de inscrições

</code_context>

<specifics>
## Specific Ideas

- Toast global de erro via `onError` no QueryClient — mantém consistência com o toast já usado nos módulos de acomodações (Phase 3)
- `fieldErrors` no `ApiError` viabiliza `form.setError()` direto do TanStack Mutation `onError` nas phases 7–9, sem lógica extra de parsing nos formulários

</specifics>

<deferred>
## Deferred Ideas

- Cache persistence scope mais granular (ex: excluir queries de audit log) — Phase 10 ou 11 se necessário
- Retry automático em mutations falhas offline — Phase 10 (Offline Hardening)

</deferred>

---

*Phase: 06-infrastructure-foundation*
*Context gathered: 2026-04-22*
