import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { auth } from './lib/auth'
import transactionRoutes from './routes/transactions.routes'

const app = new Hono()

// Test route
app.get('/', (c) => {
  return c.json({
    message: 'Vessify Backend API',
    status: 'running',
  })
})

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// Better Auth handler
app.all('/api/auth/**', async (c) => {
  try {
    return await auth.handler(c.req.raw)
  } catch (error: any) {
    console.error('Better Auth handler error:', error)
    return c.json({ error: 'Authentication error' }, 500)
  }
})

// ✅ Mount transaction routes (authMiddleware lives inside the route file)
app.route('/api/transactions', transactionRoutes)

const port = Number(process.env.PORT) || 3001

console.log(`🚀 Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
