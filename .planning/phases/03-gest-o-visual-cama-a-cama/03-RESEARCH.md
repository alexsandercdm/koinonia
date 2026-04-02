# Phase 03 Research: Gestão Visual Cama-a-Cama

**Gathered:** 2026-04-01  
**Purpose:** orientar o planejamento da fase, não detalhar execução.

## 1. Scope and Locked Decisions

- O recorte da fase é o módulo de acomodação do MVP: cadastro hierárquico `local -> quarto -> cama`, mapa operacional por evento, atribuição/liberação de cama com regra estrita de gênero e exportação em PDF.
- A interação principal já está decidida: usar `Sheet`/modal lateral para atribuição, não drag-and-drop livre.
- A experiência precisa ser mobile-first; no celular o painel de atribuição deve ocupar quase toda a tela com rolagem interna.
- O mapa operacional é consultado no contexto de um evento e usa `eventos.local_id` como ponte para a estrutura de acomodação exibida.
- A fase inclui o cadastro e manutenção de locais, quartos e camas, porque `ACO-01` a `ACO-03` são pré-requisito direto do mapa.
- A liberação de cama é explícita e remove apenas `inscricoes.cama_id`, sem cancelar inscrição nem tocar histórico financeiro.
- O PDF sai do frontend e deve reaproveitar `html2canvas` + `jsPDF`, que já existem no `apps/web/package.json`.
- `admin` e `lider` operam o módulo; `servo` fica restrito à visualização quando a rota existir.

## 2. Backend Design and Invariants

- O schema já tem as tabelas centrais: `locais`, `quartos`, `camas`, `eventos` e `inscricoes` em [`apps/api/src/db/schema.ts`](/Users/alexsandercdm/Projetos/koinonia/apps/api/src/db/schema.ts).
- O shape compartilhado já cobre `GeneroQuartoEnum`, `TipoCamaEnum`, `LocalSchema`, `QuartoSchema`, `CamaSchema` e `InscricaoSchema` em [`packages/shared/src/index.ts`](/Users/alexsandercdm/Projetos/koinonia/packages/shared/src/index.ts), então o planner pode evitar recriar tipos do zero.
- A doc técnica já descreve a regra de negócio esperada: quarto com gênero permitido, inscrição vinculada a cama, e validação estrita no backend.
- Invariantes que precisam permanecer no backend:

- `quarto.genero_permitido` é a regra base de compatibilidade.
- Uma cama só pode ter uma inscrição ativa por vez.
- Uma inscrição só pode ocupar uma cama se pertencer ao mesmo evento do mapa que está sendo operado.
- A atribuição deve ocorrer em transação e precisa proteger contra corrida de concorrência.
- A validação de gênero não pode depender da UI.
- A liberação não pode apagar a inscrição, só desvincular a cama.
- O caminho atual do schema mostra um ponto de atenção: `eventos.local_id` está opcional no código, mas a fase 3 depende dele como vínculo do mapa. O planejamento precisa decidir se isso será endurecido por migração, por regra de use case, ou por ambos.
- O módulo ainda não existe nas rotas do Fastify; o padrão atual é um módulo com `routes/`, `controllers/`, `repositories/` e `usecases/` sob `apps/api/src/modules/...`.
- O padrão de rota segue Fastify fino com schemas inline e controllers que encapsulam orquestração; veja [`apps/api/src/modules/inscricoes/routes/inscricoes.ts`](/Users/alexsandercdm/Projetos/koinonia/apps/api/src/modules/inscricoes/routes/inscricoes.ts) e [`apps/api/src/modules/inscricoes/controllers/InscricaoController.ts`](/Users/alexsandercdm/Projetos/koinonia/apps/api/src/modules/inscricoes/controllers/InscricaoController.ts).
- Para planejamento, o módulo novo provavelmente precisará de use cases separados para criar local/quarto/cama, listar mapa por evento, atribuir cama, liberar cama e exportar a visão para PDF/print.

## 3. Frontend Architecture and UX Constraints

- A web já usa React Router protegido, TanStack Query e componentes `Card`, `Button`, `ProtectedRoute`.
- O dashboard já reserva a área de Acomodações em [`apps/web/src/pages/dashboard.tsx`](/Users/alexsandercdm/Projetos/koinonia/apps/web/src/pages/dashboard.tsx), então a fase precisa encaixar uma nova rota de página, não apenas um widget.
- O `ProtectedRoute` já aceita `requiredRole`, então a planner pode prever a rota de acomodações com gating por papel, se necessário.
- O card base em [`apps/web/src/components/ui/card.tsx`](/Users/alexsandercdm/Projetos/koinonia/apps/web/src/components/ui/card.tsx) favorece renderização da grade por quarto e por cama sem criar um novo design system.
- O mapa deve ser uma grade de cards por quarto, com cada card de cama mostrando identificação, status visual e ocupante quando houver vínculo.
- Estados operacionais mínimos do mapa: `disponivel`, `ocupado`, `bloqueado`.
- O estado precisa ser legível em campo, com contraste alto e leitura rápida, não apenas estética.
- O fluxo de atribuição deve poder ser aberto a partir do card da cama, e o painel precisa funcionar bem em telas pequenas.
- O planner deve considerar atualização por invalidação/refetch de query, não refresh manual.
- A página atual de `Participantes` é apenas placeholder; isso sugere que a fase 3 deve seguir o mesmo padrão de produto em construção gradual, mas com foco operacional mais rígido.

## 4. PDF / Export Approach

- A dependência já está presente no frontend, então o caminho mais simples é exportação client-side a partir do mapa já renderizado.
- A melhor forma de planejar isso é manter uma árvore DOM dedicada ao mapa imprimível e capturar essa área com `html2canvas`, depois montar o PDF com `jsPDF`.
- O layout do PDF deve priorizar agrupamento por quarto e legibilidade offline, não fidelidade pixel-perfect da UI.
- O export precisa prever quebra de página, cabeçalho com evento/local e contraste suficiente para impressão em escala de cinza.
- Se houver estados visuais muito dependentes de cor, o planner deve exigir legendas textuais no próprio PDF.
- O pacote não mostra biblioteca de PDF no backend; portanto, a abordagem server-side só faria sentido se aparecer uma necessidade de auditoria ou impressão padronizada fora do navegador.

## 5. Testing and Verification Strategy

- Os testes de API já seguem um formato de E2E com `buildApp()`, `app.inject()` e limpeza de banco em [`apps/api/src/tests/helpers/setupTestDB.ts`](/Users/alexsandercdm/Projetos/koinonia/apps/api/src/tests/helpers/setupTestDB.ts).
- A fase 3 precisa de cobertura forte em casos de negócio, não só happy path.
- Casos obrigatórios para planejar:

- cadastro de local, quarto e cama;
- mapa carregado por evento + local;
- atribuição bem-sucedida;
- bloqueio por gênero incompatível;
- bloqueio por cama ocupada;
- liberação de cama;
- concorrência/dupla atribuição;
- exportação do mapa com conteúdo mínimo esperado.
- O planner deve prever testes unitários para as regras puras do use case e E2E para a transação com banco.
- Como o módulo mexe em regra crítica de ocupação, o verificador deve incluir ao menos um teste de regressão para garantir que a UI não consegue burlar a validação do backend.

## 6. Sequencing and Risk Notes for Planning

- Sequência recomendada: modelo de dados e contratos compartilhados -> use cases/repositórios -> rotas API -> página do mapa -> painel de atribuição -> export PDF -> testes.
- O maior risco técnico é modelar a atribuição sem corrida de concorrência; isso deve ser planejado como requisito de implementação, não como detalhe.
- O segundo risco é o descompasso entre o schema atual e a necessidade de um `eventos.local_id` efetivamente obrigatório para operação do mapa.
- O terceiro risco é a UX de mobile: se o painel virar uma tela pesada, a operação em campo piora rapidamente.
- O planner deve evitar expandir a fase para recursos fora do recorte, como check-in QR, app nativo, notificações ou refinamentos avançados de visualização.
- Há um bom encaixe para continuidade com a fase 2 porque `inscricoes.cama_id` já existe como vínculo opcional; isso reduz o tamanho da migração de domínio.
