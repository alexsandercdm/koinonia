import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
})

const env = envSchema.parse(process.env)

export { env }
export type Env = z.infer<typeof envSchema>
