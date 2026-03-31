# Architecture Map

## Overview
The architecture is structured as a **Modular Monolith** for the backend API and a **Single Page Application** for the frontend, joined via a central Monorepo.

## Backend Architecture
- **Layered / Modular Pattern**: The API organizes codebase inside `src/modules/*` following a domain separation logic. (e.g. `src/modules/pessoas`).
- **Entry Points**: `src/server.ts` bootstraps the Fastify server by calling `buildApp()` exported from `src/app.ts`.
- **Controllers / Use Cases**: Business logic seems isolated, utilizing clean, separated controllers and routes dynamically registered in `app.ts` (`participanteRoutes`, `authRoutes`).
- **Data Access**: Drizzle schemas/migrations sit neatly beside standard configuration (`src/db`).
- **Fastify Plugins Ecosystem**: Authentication, file uploads, static file serving, and CORS are cleanly attached via the Fastify app register pattern.

## Frontend Architecture
- **Component-based SPA**: The frontend utilizes standard React functional boundaries (`components/`, `pages/`).
- **Global State / Context**: Contains a `contexts/` folder (ex. `auth-context`) indicating Context API for auth and high-level React Query configuration for remote synchronization.
- **Routing Boundaries**: App-level routing takes place in `App.tsx` via `react-router-dom`, defining guarded areas using a custom `<ProtectedRoute>` layout component.

## Data Flow
1. User interacts with UI endpoints mapping to `apps/web/src/pages/`.
2. Component invokes Tanstack React Query mutators/fetchers.
3. Network request routes to `apps/api/src/app.ts` -> `/api/v1/`.
4. Route forwards handling to domain controllers -> usecases -> Drizzle ORM queries -> Postgres DB.
