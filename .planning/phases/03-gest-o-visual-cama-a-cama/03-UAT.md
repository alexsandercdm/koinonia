---
status: testing
phase: 03-gest-o-visual-cama-a-cama
source:
  - .planning/phases/03-gest-o-visual-cama-a-cama/03-01-SUMMARY.md
  - .planning/phases/03-gest-o-visual-cama-a-cama/03-02-SUMMARY.md
  - .planning/phases/03-gest-o-visual-cama-a-cama/03-03-SUMMARY.md
  - .planning/phases/03-gest-o-visual-cama-a-cama/03-04-SUMMARY.md
started: 2026-04-11T00:00:00Z
updated: 2026-04-11T00:01:00Z
---

## Current Test

number: 3
name: API: Mapa de acomodação por evento
expected: |
  GET /api/v1/eventos/:eventoId/mapa-acomodacao retorna o mapa estruturado:
  lista de quartos, cada um com lista de camas contendo identificacao, status (Disponivel/Ocupado/Bloqueado) e ocupante quando atribuído.
  Evento sem local_id vinculado retorna 422 com mensagem de erro clara.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Start the API from scratch. Server boots without errors, migration completes, and a basic authenticated API call returns live data.
result: pass

### 2. API: CRUD estrutural de locais, quartos e camas
expected: |
  Autenticado como admin ou lider:
  - POST /api/v1/acomodacoes/locais cria um local e retorna 201
  - POST /api/v1/acomodacoes/quartos cria um quarto vinculado ao local e retorna 201
  - POST /api/v1/acomodacoes/camas cria uma cama no quarto e retorna 201
  - GET /api/v1/acomodacoes/locais retorna hierarquia aninhada (local → quartos → camas)
  Autenticado como servo: POST retorna 403.
result: issue
reported: "POST de acomodações dando erro para admin e lider: Cannot read properties of undefined (reading 'parse'). Permissões de servo funcionaram."
severity: blocker

### 3. API: Mapa de acomodação por evento
expected: |
  GET /api/v1/eventos/:eventoId/mapa-acomodacao retorna o mapa estruturado:
  lista de quartos, cada um com lista de camas contendo identificacao, status (Disponivel/Ocupado/Bloqueado) e ocupante quando atribuído.
  Evento sem local_id vinculado retorna 422 com mensagem de erro clara.
result: [pending]

### 4. API: Atribuição transacional de cama
expected: |
  POST /api/v1/acomodacoes/camas/:camaId/atribuir com inscricaoId válido:
  - Retorna 200 e a cama muda de Disponivel para Ocupado no mapa
  - Segunda tentativa de atribuir a mesma cama retorna erro (cama já ocupada)
  - Atribuição com incompatibilidade de gênero retorna erro específico de gênero
  - Cama bloqueada retorna erro de cama bloqueada
result: [pending]

### 5. API: Liberação de cama
expected: |
  DELETE /api/v1/acomodacoes/camas/:camaId/atribuir em cama Ocupada:
  - Retorna 200 e a cama volta para Disponivel no mapa subsequente
  - Histórico financeiro da inscrição é preservado (inscrição permanece ativa)
result: [pending]

### 6. Web: Entrada pelo dashboard
expected: |
  Na tela do dashboard, existe um CTA de "Acomodações" (ou similar).
  Clicando nele, o usuário é navegado para /acomodacoes sem recarregar a página.
  A rota /acomodacoes é protegida — acesso direto sem login redireciona para /login.
result: [pending]

### 7. Web: Painel de estrutura (admin/lider)
expected: |
  Na aba "Estrutura" da página /acomodacoes, admin ou lider vê:
  - Seção de locais com botão "+ Novo Local" e formulário com campos nome, endereço, capacidade_total
  - Ao selecionar um local, aparecem quartos com "+ Novo Quarto" e campos nome, genero_permitido, capacidade
  - Ao selecionar um quarto, aparecem camas com "+ Nova Cama" e campos identificacao, tipo, bloqueada
  - Criação/edição bem-sucedida atualiza a lista sem reload da página
result: [pending]

### 8. Web: Estrutura read-only para servo
expected: |
  Logado como servo, na aba "Estrutura":
  - Não há botões de escrita (+ Novo, Editar)
  - Um banner informativo explica o modo somente-leitura
  - A hierarquia de local/quarto/cama é visível mas não editável
result: [pending]

### 9. Web: Mapa visual por evento
expected: |
  Na aba "Mapa Visual", após selecionar um evento com local vinculado:
  - Grade de cards de quartos é exibida
  - Cada card de quarto mostra: nome, gênero permitido, contadores (ocupadas/disponíveis/capacidade)
  - Cada cama no quarto tem um card com: identificacao, rótulo textual de status (Disponivel / Ocupado / Bloqueado) e nome do ocupante quando atribuído
  - Os status têm tratamento visual de alto contraste (verde/azul/vermelho)
result: [pending]

### 10. Web: Estado vazio sem local vinculado
expected: |
  Ao selecionar um evento que não possui local_id vinculado, a aba Mapa Visual mostra
  uma mensagem de estado vazio explicando que o evento não tem local configurado
  (não uma tela em branco ou erro genérico de API).
result: [pending]

### 11. Web: Atribuição de cama (admin/lider)
expected: |
  Logado como admin ou lider, clicando em uma cama com status Disponivel no mapa:
  - Abre um sheet/painel com lista pesquisável de inscrições sem cama
  - Clicando "Atribuir" em uma inscrição, a cama muda para Ocupado no mapa sem reload
  - O sheet fecha e o mapa reflete o novo ocupante
result: [pending]

### 12. Web: Liberação de cama (admin/lider)
expected: |
  Clicando em uma cama Ocupada no mapa (admin ou lider):
  - Sheet abre mostrando o nome do ocupante e botão "Liberar"
  - Ao clicar Liberar há uma etapa de confirmação antes de executar
  - Confirmando, a cama volta para Disponivel no mapa sem reload
result: [pending]

### 13. Web: Erros específicos da API no sheet
expected: |
  Ao tentar atribuir uma cama com restrição:
  - Inscrição com gênero incompatível ao quarto → mensagem específica de gênero visível no sheet (não toast genérico)
  - Cama já ocupada (corrida) → mensagem específica de cama ocupada
  - Cama bloqueada → mensagem específica de cama bloqueada
result: [pending]

### 14. Web: Servo sem controles de atribuição no mapa
expected: |
  Logado como servo, os cards de cama no mapa são não-interativos:
  - Não há cursor pointer nas camas
  - Clicar em uma cama não abre o sheet de atribuição
  - Nenhum botão "Atribuir" ou "Liberar" é visível
result: [pending]

### 15. Web: Exportação de PDF do mapa
expected: |
  Com um mapa carregado, admin ou lider vê um botão "Exportar PDF" (ou similar) acima do mapa.
  Clicando nele, o browser inicia o download de um arquivo PDF com nome terminando em -mapa-acomodacao.pdf.
  O PDF contém: cabeçalho com nome do evento e local, timestamp, agrupamento por quarto, legenda textual de status (Disponivel/Ocupado/Bloqueado), e não inclui botões/controles interativos.
result: [pending]

## Summary

total: 15
passed: 1
issues: 1
skipped: 0
pending: 13

## Gaps

- truth: "POST /api/v1/acomodacoes/locais (e quartos/camas) devem retornar 201 para admin e lider"
  status: failed
  reason: "User reported: Cannot read properties of undefined (reading 'parse') ao fazer POST de acomodações como admin/lider"
  severity: blocker
  test: 2
  artifacts: []
  missing: []
