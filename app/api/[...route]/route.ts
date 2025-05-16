import { handle } from 'hono/vercel'
import app from '../app'

// Use Edge Runtime for better performance and compatibility
export const runtime = 'edge'

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