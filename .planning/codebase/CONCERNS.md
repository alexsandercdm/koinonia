# Concerns Map

## Technical Debt & Ongoing Refactoring
- **In-progress Refactoring**: The history shows a shift towards a "Modular Monolith". The API might still harbor legacy routes within the `/controllers` folder that haven't been migrated into the `/modules/*` domain boundary structure.
- **Cross-dependency Imports**: Need to ensure strict adherence separating frontend from backend contexts inside Turborepo avoiding leaked schema dependencies.

## Data and Validation Fragility
- **Auth Configuration**: Switching towards `@better-auth` combined with manual `fastify-jwt` strategies means possible duplication or mixed logic inside the authorization layer (`authRoutes` vs `customAuthRoutes`).
- **Session Debugging Issues**: Historical traces indicate issues dealing with Vitest environments generating `Session@[TerminalName: node, ProcessId: 10102]` lifecycle errors. The database tear-downs might hang during complex async actions inside Vitest's parallel runner.

## Security & Privacy
- **JWT Secret**: Current implementation in `app.ts` relies on an environment variable, but falls back to `'secret123'`. This logic should immediately throw an error rather than allowing a dummy string during production bootstrapping.
- **File Uploads Bound**: Ensure local `uploads/` directory mapped via `@fastify/static` explicitly blocks executable path traversal.
