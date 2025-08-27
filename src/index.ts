import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import v1 from './api/v1/index.js'
import { connectDB } from './db/mongoose.js'
import 'dotenv/config'

const app = new Hono()

connectDB()

app.route('/api/v1', v1)

app.get('/api', (c) => c.json({ message: 'Zyphera API root' }))

export default app

serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
