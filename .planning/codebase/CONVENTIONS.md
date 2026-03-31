# Conventions Map

## Code Organization & Naming
- **File Naming Conventions**: Files appear to use PascalCase for React components (`App.tsx`, `ParticipantsPage.tsx`) and kebab-case or camelCase for utilities, hooks and standard configurations (`auth-context.tsx`, `app.ts`).
- **Path Aliasing**: Assumed configured within `tsconfig.json` utilizing proper barrel exports (to avoid dirty imports).
- **Component Design**: React context provider pattern is used significantly, specifically shielding UI elements behind a custom `<ProtectedRoute>` HOC component.
- **Backend Domain Separation**: The API adopts the "Modular Monolith" file structure where business cases, repositories, and routes are bundled in nested module folders instead of scattered across the `/controllers` and `/models` directories.

## API Validation & Error Handling
- **Zod Schemas**: Used ubiquitously across Fastify endpoints (and frontend forms) for strong type inference and runtime request payload validation.
- **Errors**: Fastify's implicit global error handlers are likely leveraged considering custom logger injection inside `src/app.ts`.

## Styling
- **CSS Utility Classes**: Pure Tailwind utility classes injected dynamically with `clsx` and `tailwind-merge` avoiding CSS module drift.
- **UI Kit Extensibility**: Elements in `components/ui/` indicate Shadcn-ui base patterns for primitive extraction.
