import { config } from 'dotenv'
import { vi } from 'vitest'

// Load test environment variables
config({ path: '.env.test' })

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
