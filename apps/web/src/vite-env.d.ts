/// <reference types="vite/client" />

// Workaround para TS2742: Better Auth client type inference
// O tipo inferido do createAuthClient não pode ser exportado sem declaração explícita
import type { AuthClient } from 'better-auth/dist/client/vanilla'

declare global {
  type AppAuthClient = AuthClient<{
    baseURL: string
  }>
}

export {}
