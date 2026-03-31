import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer } from "better-auth/plugins"
import { db } from "../db"
import * as schema from "../db/schema"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [
    bearer(),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "servo",
      },
    },
  },
  debug: true,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 8, // 8 horas
    updateAge: 60 * 60 * 1, // 1 hora
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  socialProviders: {},
})
