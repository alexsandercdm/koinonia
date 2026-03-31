# Tech Stack Map

## Overview
This repository uses a Monorepo strategy managed by Turborepo (`turbo`) and `pnpm workspaces`.
It is built with TypeScript on Node 20+ containing a web frontend application and a backend API.

## Frontend App: web (`apps/web`)
- **Runtime:** Node.js
- **Language:** TypeScript 5+
- **Framework:** React 18
- **Build Tooling:** Vite 5
- **Styling:** Tailwind CSS + Radix UI (Shadcn style) + `clsx`/`tailwind-merge`
- **Routing:** React Router DOM
- **Data Fetching:** TanStack React Query v5
- **Forms:** React Hook Form + Zod for schema validation
- **Data Visualization:** Recharts
- **PDF Generation:** jspdf + html2canvas

## Backend App: api (`apps/api`)
- **Runtime:** Node.js (tsx for dev runtime, node for production)
- **Language:** TypeScript 5+
- **Web Framework:** Fastify v4
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (via `postgres` pg client)
- **Validation:** Zod
- **Authentication:**  Custom/Better Auth, fastify-jwt
- **File Uploads:** `@fastify/multipart` + `@fastify/static` (handling local uploads via `uploads/` folder)

## Shared Library (`packages/shared`)
- This implies a shared schema/type definitions package used across both API and Web apps.

## DevOps & Tooling
- **Package Manager:** Pnpm v9
- **Monorepo:** Turborepo v2
- **Testing:** Playwright for E2E, Vitest for unit/integration tests
- **Linting:** ESLint + TypeScript ESLint
- **Docker:** Utilized for development environment (`docker-compose.dev.yml`)
