/// <reference types="vite/client" />
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient: any = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  basePath: "/api/v1/auth",
  plugins: [organizationClient()],
})
