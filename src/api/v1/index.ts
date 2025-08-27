import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { cors } from 'hono/cors'
import googleProvider from './auth/providers/google/route.js'

const v1 = new Hono()

v1.use('*', cors({
    origin: 'https://wallet.zyphera.vercel.app',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

v1.use(csrf())
v1.route('/auth/providers/google', googleProvider)

export default v1
