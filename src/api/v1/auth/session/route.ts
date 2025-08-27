import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { refreshToken } from '../../../../utils/sessions.js'
import { env } from 'hono/adapter'

const session = new Hono()

session.post('/refresh', async (c) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c)
    const oldRefreshToken = getCookie(c, 'zyphera_refresh')
    if (!oldRefreshToken) return c.json({ error: 'No refresh token' }, 401)

    try {
        const { accessToken, refreshToken: newRefreshToken } = await refreshToken(oldRefreshToken, JWT_SECRET)

        setCookie(c, 'zyphera_access', accessToken, {
            httpOnly: false,
            path: '/',
            maxAge: 15 * 60,
            sameSite: 'Lax',
            secure: true,
        })

        setCookie(c, 'zyphera_refresh', newRefreshToken, {
            httpOnly: true,
            path: '/',
            maxAge: 30 * 24 * 60 * 60,
            sameSite: 'Lax',
            secure: true,
        })

        return c.json({ accessToken })
    } catch (err) {
        return c.json({ error: 'Invalid refresh token' }, 401)
    }
})

export default session
