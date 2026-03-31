import 'dotenv/config'
import { env } from './config/env'
import { buildApp } from './app'

const server = buildApp()

// Start server
const start = async () => {
  try {
    await server.listen({ 
      port: env.PORT, 
      host: '0.0.0.0' 
    })
    console.log(`🚀 Server running on http://localhost:${env.PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
