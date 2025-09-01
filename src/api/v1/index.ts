import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { dbMiddleware } from '../../middleware/db.js'

import googleProvider from './auth/providers/google/route.js'
import session from './auth/session/route.js'

const v1 = new Hono()

v1.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'https://wallet.zyphera.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
    return allowed.includes(origin ?? '') ? origin : 'https://wallet.zyphera.vercel.app'
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Cookie', 'Content-Type', 'Authorization'],
  credentials: true,
}))

v1.use('*', dbMiddleware)

v1.route('/auth/providers/google', googleProvider)
v1.route('/auth/session', session)

export default v1
