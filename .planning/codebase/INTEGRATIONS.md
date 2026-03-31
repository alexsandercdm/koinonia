# Integrations Map

## Databases
### PostgreSQL
- The primary datastore used by the Fastify backend application, accessed via `Drizzle ORM` using the `postgres` Node package driver.
- Connectivity handled via `dotenv` providing secrets for `.env` connection strings.

## Third-Party Libraries / Framework Integrations
### Better Auth
- A server-side library used for Identity Management `better-auth`.
- There is a `better-auth/drizzle-adapter` connected indicating tighter integration into the primary database tables.

### Vite & Turborepo
- The monorepo uses Turborepo extensively to orchestrate parallel tasks (like running `pnpm dev` for both node Fastify and Vite simultaneously).

## Webhooks & External Services
- Currently, no external webhooks or heavy API integrations (e.g., Stripe, Sendgrid, etc.) are explicitly revealed.
- Authentication relies heavily on `fastify-jwt` and potentially `custom-auth`/`better-auth` meaning there might be a tight internal JWT strategy as opposed to an external IDP (like Auth0).

## Infrastructure Services
- Local development is integrated directly with Docker via `docker-compose.dev.yml`, presumably setting up instances of PostgreSQL for development and potentially `pgAdmin`.
- Wait for a deeper scan for any active email dispatchers or queues, but it currently appears perfectly self-contained.
