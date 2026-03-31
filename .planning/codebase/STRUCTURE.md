# Structure Map

## Monorepo Layout (Turborepo)
```text
/
├── apps/
│   ├── api/          # Node/Fastify + Drizzle backend
│   └── web/          # React + Vite frontend
├── packages/
│   └── shared/       # Shared TypeScript types / Zod schemas
├── init-scripts/     # Setup scripts (docker entrypoints, etc.)
├── package.json      # Root pnpm workspaces definition
└── turbo.json        # Turborepo task definition
```

## Backend Structure (`apps/api/src/`)
- `app.ts` / `server.ts`: Server bootstrapping.
- `config/`: Environment configuration (`env.ts`).
- `db/`: Database configuration and Drizzle exports.
- `controllers/`: High-level controller entry points (probably legacy or global endpoints).
- `middleware/`: Fastify request middleware.
- `modules/`: Domain specific modules isolating features. 
  - `pessoas/`: Handling 'participants' specific application layer (routes, usespaces, controllers)
- `routes/`: Non-modular global routes.
- `scripts/`: Development utility scripts (`seed.ts`, `test-migrate.ts`).
- `tests/`: Integration/E2E test files for the backend logic.

## Frontend Structure (`apps/web/src/`)
- `App.tsx` / `main.tsx`: React mounting logic.
- `index.css`: Global Tailwind CSS import declarations.
- `assets/`: Static image/icon files.
- `components/`: UI layer shared components (`protected-route`, potentially UI kit).
- `contexts/`: React state context (`auth-context.tsx`).
- `hooks/`: Reusable react hooks.
- `lib/`: Utility libraries.
- `pages/`: Page level layout views (`login`, `dashboard`, `ParticipantsPage`).
- `tests/`: Frontend specific tests.
- `types/`: Global or frontend specific type definitions.
