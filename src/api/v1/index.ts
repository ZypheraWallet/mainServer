import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'

import { dbMiddleware } from '../../middleware/db.js'

import googleProvider from './auth/providers/google/route.js'
import session from './auth/session/route.js'

const v1 = new Hono()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001'

v1.use('*', cors({
  origin: FRONTEND_URL,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Cookie', 'Content-Type', 'Authorization'],
  credentials: true,
}))

v1.use('*', dbMiddleware)

v1.route('/auth/providers/google', googleProvider)
v1.route('/auth/session', session)

export default v1
