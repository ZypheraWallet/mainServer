import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { refreshToken } from '../../../../utils/sessions.js'
import { env } from 'hono/adapter'

const session = new Hono()

session.post('/refresh', async (c) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c)
    const oldRefreshToken = getCookie(c, 'zyphera_refresh')
    if (!oldRefreshToken) return c.json({ error: 'No refresh token' }, 401)

    try {
        const { accessToken, newRefreshToken } = await refreshToken(oldRefreshToken, JWT_SECRET)

        return c.json({ accessToken, newRefreshToken })
    } catch (err) {
        return c.json({ error: 'Invalid refresh token' }, 401)
    }
})

export default session
