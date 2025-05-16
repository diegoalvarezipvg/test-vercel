import { handle } from 'hono/vercel'
import app from '../app'

// Use Node.js runtime since our Hono app uses Node.js features
export const runtime = 'nodejs'

// Create a handler that strips the /api prefix before passing to Hono
const handler = handle(app)

// Export all HTTP methods
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const OPTIONS = handler
export const HEAD = handler 