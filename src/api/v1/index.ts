import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { dbMiddleware } from '../../middleware/db.js'

import googleProvider from './auth/providers/google/route.js'

import session from './auth/session/route.js'
import wallet from './wallet/route.js'

const v1 = new Hono()

v1.use('*', cors({
    origin: (origin) => {
        const allowed = [
            'http://localhost:3001',
            'https://wallet.zyphera.vercel.app'
        ]
        return allowed.includes(origin ?? '') ? origin : undefined
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Cookie', 'Content-Type', 'Authorization'],
    credentials: true,
}))

v1.use('*', dbMiddleware)

v1.route('/auth/providers/google', googleProvider)
v1.route('/auth/session', session)
v1.route('/wallet', wallet)

export default v1
