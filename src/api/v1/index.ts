import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import googleProvider from './auth/providers/google/route.js'

const v1 = new Hono()

v1.use(
    '/auth/*',
    cors({
        origin: 'http://localhost:3001',
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
        credentials: true,
        maxAge: 600,
    })
)

v1.use(csrf())
v1.route('/auth/providers/google', googleProvider)

export default v1
