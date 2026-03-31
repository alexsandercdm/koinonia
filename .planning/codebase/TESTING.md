# Testing Map

## Frameworks & Runner
- **Unit and Integration**: Utilizing Vitest (`vitest`) on both the backend and frontend apps.
- **End-to-End**: A comprehensive test suite using Playwright is included as a top-level workspace dependency.
- **TLC Spec-Driven**: The chat history highlights testing utilizing a local "TLC Spec-Driven" skill, which structures rigorous test plans targeting all domain abstractions.

## Backend Testing Environment
- Test files reside beside business logic or use cases. Example from history: `GetParticipanteHistoricoUseCase.test.ts`.
- Command implementations explicitly utilize `db:test:migrate` pointing to `tsx src/scripts/test-migrate.ts` reflecting that tests use real (or containerized) databases rather than mock databases.

## Mocking & Coverage
- Currently standardizing on Vitest plugins for DOM (frontend) and Postgres database schema tearing up/down (backend). 
- Further exploration will map exact test coverage bounds, though robust parallel execution suggests isolated transactional models.
