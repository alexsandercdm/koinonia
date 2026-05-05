import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer, organization as organizationPlugin } from "better-auth/plugins"
import { adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access"
import { db } from "../db"
import * as schema from "../db/schema"
import { env } from "./env"
import { OrgRole } from "../lib/tenant/types"

const trustedOrigins = env.CORS_ORIGIN
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin && origin !== '*')

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  plugins: [
    bearer(),
    organizationPlugin({
      allowUserToCreateOrganization: true,
      creatorRole: OrgRole.PRESIDENTE,
      roles: {
        [OrgRole.PRESIDENTE]: ownerAc,
        [OrgRole.PASTOR_PRINCIPAL]: adminAc,
        [OrgRole.PASTOR_REDE]: memberAc,
        [OrgRole.DISCIPULADOR]: memberAc,
        [OrgRole.LIDER_CELULA]: memberAc,
        [OrgRole.MEMBRO]: memberAc,
      },
    }),
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
    autoSignIn: true,
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
