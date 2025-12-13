import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types'

// Import routes
import adminRoutes from './routes/admin'
import apiRoutes from './routes/api'
import publicRoutes from './routes/public'
import adminUpload from './routes/admin-upload'

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))

// Serve uploaded files from R2
app.route('/uploads', adminUpload)

// Mount routes
app.route('/admin', adminRoutes)
app.route('/api', apiRoutes)
app.route('/', publicRoutes)

export default app
