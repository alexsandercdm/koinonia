# Remodelagem do Módulo de Participantes

A requisição atual visa reorganizar a entidade "Participantes" para se adequar ao mais recente modelo de arquitetura Clean (Monolito Modular) estabelecido no projeto `koinonia`. O código existente será migrado para respeitar os module boundaries definidos.

## Proposed Changes

Módulo Base: **pessoas**

As regras de negócio sob o domínio "participantes" (bem como o tipo relacionado "pessoa") pertencem ao módulo "pessoas".

As pastas foram estruturadas em `apps/api/src/modules/pessoas` e os arquivos migrados. O próximo passo de implementação envolverá refazer detalhadamente os imports para conectar corretamente as instâncias com os recursos externos à API (como `db` e utilitários), bem como religar as rotas da aplicação para o novo encapsulamento de plugin.

### Pessoas Module (Refatoração de Caminhos)

Refatorará as referências de path para cada um dos usecases, endpoints e modelos migrados.

#### [MODIFY] [ParticipanteController.ts](file:///Users/alexsandercdm/Projetos/koinonia/apps/api/src/modules/pessoas/controllers/ParticipanteController.ts)
Ajustar importações de use cases que vieram para o mesmo módulo, para caminho relativo. Ajustar paths de requests globais/externos.

#### [MODIFY] [participantes.ts](file:///Users/alexsandercdm/Projetos/koinonia/apps/api/src/modules/pessoas/routes/participantes.ts)
Ajustar o import do `ParticipanteController` e validar localmente.

#### [MODIFY] `Use Cases e Testes`
Ajustar o import de Database e schema global em todos os `*Participante*.ts` e seus testes `*Participante*.test.ts`. 
Ex: em `CreateParticipanteUseCase.ts` arrumar as referências para `CreatePessoa` puxando de `../../entities/pessoa`.

#### [MODIFY] [pessoa.ts](file:///Users/alexsandercdm/Projetos/koinonia/apps/api/src/modules/pessoas/entities/pessoa.ts)
Ajustar dependências com o Drizzle schema.

### Camada Externa

#### [MODIFY] [app.ts](file:///Users/alexsandercdm/Projetos/koinonia/apps/api/src/app.ts)
Atualizar a referência de registro de plugin de rota no fastify de `./routes/participantes` para `./modules/pessoas/routes/participantes`.

## Verification Plan

### Automated Tests
- Executaremos o `pnpm lint` e `pnpm tsc` para validar resolução de tipagem e caminhos.
- Executaremos testes automatizados na API para garantir que as reestruturações não quebraram o build e que os testes de e2e e unitários continuam aprovando.
