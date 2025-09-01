import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { findUserByGoogleId, createUser } from '../../../../../utils/user.js'
import { createSession } from '../../../../../utils/sessions.js'

const google = new Hono()

google.get('/getLink', async (c) => {
    const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = env<{
        GOOGLE_CLIENT_ID: string
        GOOGLE_REDIRECT_URI: string
    }>(c)

    const GOOGLE_SCOPE = ['openid', 'profile', 'email'].join(' ')

    const state = Math.random().toString(36).substring(2, 15)

    setCookie(c, 'oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        domain: '.zyphera.vercel.app',
        maxAge: 10 * 60,
    })

    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: GOOGLE_SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        state
    })

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return c.json({ url })
})

google.get('/callback', async (c) => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    FRONTEND_URL,
    JWT_SECRET
  } = env<{
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_REDIRECT_URI: string
    FRONTEND_URL: string
    JWT_SECRET: string
  }>(c)

  const code = c.req.query('code')
  const returnedState = c.req.query('state')

  if (!code || !returnedState) return c.text('Missing code or state', 400)

  const savedState = getCookie(c, 'oauth_state')
  if (!savedState || savedState !== returnedState) return c.text('Invalid state', 400)
  deleteCookie(c, 'oauth_state', { path: '/' })

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()
  if (!tokenRes.ok) return c.text('Failed to exchange code', 400)

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userInfo = await userInfoRes.json()

  let user = await findUserByGoogleId(userInfo.sub)
  if (!user) {
    user = await createUser({
      googleId: userInfo.sub,
      email: userInfo.email,
      username: userInfo.name,
      avatarUrl: userInfo.picture,
    })
  }

  const { accessToken, refreshToken } = await createSession(user._id as string, JWT_SECRET)

  return c.html(`
    <script>
      window.opener.postMessage({
        type: 'google-auth-success',
        accessToken: "${accessToken}",
        refreshToken: "${refreshToken}"
      }, "http://localhost:3000/");
      window.close();
    </script>
  `)
})


export default google
